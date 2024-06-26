namespace turns {

    export function SpinTurn(deg: number, speed: number) {
        CHASSIS_L_MOTOR.setBrake(true); CHASSIS_R_MOTOR.setBrake(true); // Удерживать при тормозе
        CHASSIS_L_MOTOR.stop(); CHASSIS_R_MOTOR.stop(); // Остановить моторы перед командой поворота
        let calcMotRot = (deg * WHEELS_W) / WHEELS_D; // Расчитать градусы для поворота в градусы для мотора
        CHASSIS_L_MOTOR.setPauseOnRun(false); CHASSIS_R_MOTOR.setPauseOnRun(false); // Отключаем у моторов ожидание выполнения
        CHASSIS_L_MOTOR.run(speed, calcMotRot, MoveUnit.Degrees); // Передаём команду движения левый мотор
        motors.mediumC.run(-speed, calcMotRot, MoveUnit.Degrees); // Передаём команду движения правый мотор
        CHASSIS_L_MOTOR.pauseUntilReady(); CHASSIS_R_MOTOR.pauseUntilReady(); // Ждём выполнения моторами команды
        CHASSIS_L_MOTOR.stop(); CHASSIS_R_MOTOR.stop(); // Остановить моторы для защиты, если будет calcMotRot = 0, то моторы будут вращаться бесконечно
    }
    
}