const B_RAW_REF_LCS = 624; // Чёрный для левого датчика
const B_RAW_REF_RCS = 633; // Чёрный для правого датчика
const W_RAW_REF_LCS = 536; // Белый для левого датчика
const W_RAW_REF_RCS = 563; // Белый для правого датчика

// const B_RAW_REF_LCS = 645; // Чёрный для левого датчика
// const B_RAW_REF_RCS = 629; // Чёрный для правого датчика
// const W_RAW_REF_LCS = 573; // Белый для левого датчика
// const W_RAW_REF_RCS = 520; // Белый для правого датчика

let LW_TRESHOLD = 50; // Пороговое значение для определение перекрёстка

let ULTRASONIC_RESPONCE_DISTANCE = 30; // Дистанция, на которую реагировать

let DIST_ROLLING_MOVE_OUT = 30; // Дистанция для прокатки без торможения на перекрёстке в мм

let MANIP_DEFL_SPEED = 40; // Скорость работы манипулятора по умолчанию

let MANIPULATOR_MOTOR = motors.mediumA; // Ссылка на объект мотора манипулятора
//let CHASSIS_MOTORS = motors.mediumBC; // Ссылка на объект моторов в шасси
let CHASSIS_L_MOTOR = motors.mediumB; // Ссылка на объект левого мотора в шасси
let CHASSIS_R_MOTOR = motors.mediumC; // Ссылка на объект правого мотора в шасси

let LCS = sensors.color2; // Ссылка на объект левого датчика цвета
let RCS = sensors.color3; // Ссылка на объект правого датчика цвета

let WHEELS_D = 68.8; // Диаметер колёс в мм
let WHEELS_W = 190; // Расстояние между центрами колёс в мм

let robotRole = RobotOrder.None;

// Manipulator(ClawState.Open);
// Manipulator(ClawState.Close);
// turns.SpinTurn(90, 30);

function Main() { // Определение главной функции
    MANIPULATOR_MOTOR.setInverted(false); // Инверсия мотора манипулятора
    CHASSIS_L_MOTOR.setInverted(true); CHASSIS_R_MOTOR.setInverted(false);
    Manipulator(ClawState.Open);
    brick.printString("RUN", 6, 14);
    let startBtn = "NONE";
    while (true) {
        if (brick.buttonLeft.isPressed()) {
            startBtn = "LEFT";
            robotRole = RobotOrder.Master;
            break;
        } else if (brick.buttonRight.isPressed()) {
            startBtn = "RIGHT";
            robotRole = RobotOrder.Slave;
            break;
        } else if (brick.buttonUp.isPressed()) {
            startBtn = "UP" ;
            break;
        }
        pause(5);
    }
    // Ждать выполнения события, что кнопка так же была отжата
    pauseUntil(() => brick.buttonUp.wasPressed() || brick.buttonDown.wasPressed() || brick.buttonLeft.wasPressed() || brick.buttonRight.wasPressed() || brick.buttonEnter.wasPressed());
    brick.clearScreen();
    if (robotRole == RobotOrder.Master) {
        motions.LineFollowToDist(25, AfterMotion.BreakStop, { speed: 20, Kp: 0.8, Kd: 2.6 });
        Manipulator(ClawState.Close);
        while (true) {
            Krug();
            Podgotovka();
            pauseUntil(() => sensors.ultrasonic4.distance() < 20);
            pause(1500);
            motions.LineFollowToDist(25, AfterMotion.BreakStop);
            Manipulator(ClawState.Close);
            turns.SpinTurn(180, 40);
        }
    } else if (robotRole == RobotOrder.Slave) {
        while(true) {
            Podgotovka();
            pauseUntil(() => sensors.ultrasonic4.distance() < 20);
            pause(1500);
            motions.LineFollowToDist(25, AfterMotion.BreakStop);
            Manipulator(ClawState.Close);
            turns.SpinTurn(180, 40);
            Krug();
        }
    } else if (startBtn == "UP") {
        custom.FunctionsTune(0);
    }
}

function Krug() {
    motions.LineFollowToDist(1500, AfterMotion.NoStop, { speed: 70, Kp: 0.8, Kd: 2.6 });
    // motions.LineFollowToDist(100, AfterMotion.NoStop, { speed: 60 });
    // motions.LineFollowToIntersaction(AfterMotion.NoStop, { speed: 50 });
    // motions.LineFollowToDist(500, AfterMotion.NoStop, { speed: 50 });
    // motions.LineFollowToDist(1500, AfterMotion.NoStop, { speed: 70 });
    motions.LineFollowToIntersaction(AfterMotion.NoStop);
    motions.LineFollowToDist(250, AfterMotion.BreakStop, { speed: 50 });
    Manipulator(ClawState.Open, 20);
    motions.DistMove(100, -20, true);
}

function Podgotovka() {
    pause(1000);
    motions.LineFollowToIntersaction(AfterMotion.BreakStop, { speed: 40 });
    turns.SpinTurn(180, 40);
    motions.LineFollowToDist(200, AfterMotion.BreakStop, { speed: 40 });
}

Main(); // Запуск главной функции