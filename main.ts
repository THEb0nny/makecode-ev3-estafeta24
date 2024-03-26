const B_RAW_REF_LCS = 624; // Чёрный для левого датчика
const B_RAW_REF_RCS = 633; // Чёрный для правого датчика
const W_RAW_REF_LCS = 536; // Белый для левого датчика
const W_RAW_REF_RCS = 563; // Белый для правого датчика

let LW_KP_2S = 0.8; // Пропорциональный коэффицент движения по линии
let LW_KI_2S = 0; // Интегральный коэффициент движения по линии
let LW_KD_2S = 2.6; // Дифференциальный коэффиент движения по линии

let LW_SPEED = 60; // на скор. 70 Kp=0.8 на скор 60 Kp=0.7 Kd=2.5

let LW_TRESHOLD = 50; // Пороговое значение для определение перекрёстка

let LW_DIST_TO_LET = 30; // Дистанция, на которую реагировать на препятствие

let DIST_ROLLING_MOVE_OUT = 20; // Дистанция для прокатки без торможения на перекрёстке в мс

let MANIP_DEFL_SPEED = 40; // Скорость работы манипулятора по умолчанию

let MANIPULATOR_MOTOR = motors.mediumA; // Ссылка на объект мотора манипулятора
//let CHASSIS_MOTORS = motors.mediumBC; // Ссылка на объект моторов в шасси
let CHASSIS_L_MOTOR = motors.mediumB; // Ссылка на объект левого мотора в шасси
let CHASSIS_R_MOTOR = motors.mediumC; // Ссылка на объект правого мотора в шасси

let L_CS = sensors.color2; // Ссылка на объект левого датчика цвета
let R_CS = sensors.color3; // Ссылка на объект правого датчика цвета

let WHEELS_D = 68; // Диаметер колёс в мм
let WHEELS_W = 135; // Расстояние между центрами колёс в мм

function Main() { // Определение главной функции
    motors.mediumB.setInverted(true); motors.mediumC.setInverted(false);
    brick.printString("RUN", 6, 14);
    let startBtn = "NONE";
    while (true) {
        if (brick.buttonEnter.isPressed()) {
            startBtn = "ENTER";
            break;
        } else if (brick.buttonLeft.isPressed()) {
            startBtn = "LEFT";
            break;
        }
        pause(5);
    }
    // Ждать выполнения события, что кнопка так же была отжата
    pauseUntil(() => brick.buttonUp.wasPressed() || brick.buttonDown.wasPressed() || brick.buttonLeft.wasPressed() || brick.buttonRight.wasPressed() || brick.buttonEnter.wasPressed());
    brick.clearScreen();
    if (startBtn == "ENTER") {
        motions.LineFollowToDist(1300, 70, AfterMotion.NoStop, false);
        motions.LineFollowToDist(100, 60, AfterMotion.NoStop, false);
        motions.LineFollowToDist(100, 50, AfterMotion.NoStop, false);
        LW_SPEED = 40;
        motions.LineFollowToIntersaction(false);
        motions.LineFollowToDist(500, 30, AfterMotion.NoStop, false);
        LW_SPEED = 70;
        motions.LineFollowToIntersaction(false);
        motions.LineFollowToDist(300, 50, AfterMotion.BreakStop, false);
    } else if (startBtn == "LEFT") {
        custom.FunctionsTune(0);
    }
}

Main(); // Запуск главной функции