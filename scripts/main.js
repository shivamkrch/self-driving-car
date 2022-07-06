const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
let cars = generateCars(300);
let bestCar = cars[0];
const savedBrain = localStorage.getItem("bestBrain");
if (savedBrain) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(savedBrain);
    if (i) {
      NeuralNetwork.mutate(cars[i].brain, 0.1);
    }
  }
}
const traffic = [
  new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(2), -650, 30, 50, "DUMMY", 2),
  new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2)
];

animate();

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

function generateCars(N = 1) {
  const cars = [];
  for (let i = 1; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
  }
  return cars;
}

function generateTraffic(N = 1) {
  for (let i = 1; i <= N; i++) {
    const prevCarPos = i > 1 ? traffic[traffic.length - 1].y : bestCar.y - 50;
    traffic.push(
      new Car(
        road.getLaneCenter(Math.floor(Math.random() * road.laneCount)),
        prevCarPos - Math.ceil(Math.random() * 10 + 110),
        30,
        50,
        "DUMMY",
        2
      )
    );
  }
}

function animate(time) {
  traffic.forEach((t) => t.update(road.borders, []));
  cars.forEach((car) => car.update(road.borders, traffic));
  bestCar = cars.find((car) => car.y === Math.min(...cars.map((c) => c.y)));

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

  road.draw(carCtx);

  traffic.forEach((t, i) => t.draw(carCtx, "red", false, `T${i + 1}`));

  carCtx.globalAlpha = 0.2;
  cars.forEach((car, i) => car.draw(carCtx, "blue", false, `C${i + 1}`));
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, "blue", true, "#1");

  carCtx.restore();

  networkCtx.lineDashOffset = -time / 50;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);

  if (traffic[traffic.length - 1].y - bestCar.y > 300) {
    generateTraffic(20);
  }
  if (traffic.length > 50) {
    traffic.shift();
  }
  if (cars.length > 100) {
    cars = cars.filter((car) => car === bestCar || !car.damaged);
  }

  requestAnimationFrame(animate);
}
