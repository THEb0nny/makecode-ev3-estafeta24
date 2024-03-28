namespace motions {

    /**
     * Управление моторами шасси.
     * @param dir направление поворота, eg: 0
     * @param speed скорость движения, eg: 80
     */
    export function ChassisControl(dir: number, speed: number) {
        let mB = speed + dir, mC = speed - dir;
        let z = speed / Math.max(Math.abs(mB), Math.abs(mC));
        mB *= z; mC *= z;
        CHASSIS_L_MOTOR.run(mB); CHASSIS_R_MOTOR.run(mC);
    }

    export function ChassisStop(setBrake: boolean) {
        CHASSIS_L_MOTOR.setPauseOnRun(false); CHASSIS_R_MOTOR.setPauseOnRun(false);
        CHASSIS_L_MOTOR.setBrake(setBrake); CHASSIS_R_MOTOR.setBrake(setBrake);
        CHASSIS_L_MOTOR.stop(); CHASSIS_R_MOTOR.stop();
        CHASSIS_L_MOTOR.setPauseOnRun(true); CHASSIS_R_MOTOR.setPauseOnRun(true);
    }

    export function DistMove(dist: number, speed: number, setBreak: boolean) {
        let mRotCalc = (dist / (Math.PI * WHEELS_D)) * 360; // Расчёт угла поворота на дистанцию
        CHASSIS_L_MOTOR.setBrake(setBreak); CHASSIS_R_MOTOR.setBrake(setBreak); // Установить жёсткий тип торможения
        CHASSIS_L_MOTOR.setPauseOnRun(false); CHASSIS_R_MOTOR.setPauseOnRun(false); // Отключаем у моторов ожидание выполнения
        CHASSIS_L_MOTOR.run(speed, mRotCalc, MoveUnit.Degrees); CHASSIS_R_MOTOR.run(speed, mRotCalc, MoveUnit.Degrees); // Передаём команды движения на моторы
        CHASSIS_L_MOTOR.pauseUntilReady(); CHASSIS_R_MOTOR.pauseUntilReady(); // Ждём выполнения моторами команды
        CHASSIS_L_MOTOR.setPauseOnRun(true); CHASSIS_R_MOTOR.setPauseOnRun(true); // Включаем обратно у моторов ожидание выполнения ???
    }

    // Вспомогательная функция для типа торможения движения на расстоние без торможения. Например, для съезда с линии, чтобы её не считал алгоритм движения по линии.
    export function RollingMoveOut(dist: number, speed: number) {
        if (dist == 0 || speed == 0) {
            motions.ChassisStop(true);
            return;
        }
        let lMotEncPrev = CHASSIS_L_MOTOR.angle(), rMotEncPrev = CHASSIS_R_MOTOR.angle(); // Значения с энкодеров моторов до запуска
        let calcMotRot = (dist / (Math.PI * WHEELS_D)) * 360; // Дистанция в мм, которую нужно пройти
        //CHASSIS_MOTORS.steer(0, speed); // Команда вперёд
        motions.ChassisControl(0, speed);

        let prevTime = 0; // Переменная предыдущего времения для цикла регулирования
        while (true) { // Пока моторы не достигнули градусов вращения
            let currTime = control.millis(); // Текущее время
            let dt = currTime - prevTime; // Время за которое выполнился цикл
            prevTime = currTime; // Новое время в переменную предыдущего времени
            let lMotEnc = CHASSIS_L_MOTOR.angle(), rMotEnc = CHASSIS_R_MOTOR.angle(); // Значения с энкодеров моторы
            if (Math.abs(lMotEnc - lMotEncPrev) >= Math.abs(calcMotRot) || Math.abs(rMotEnc - rMotEncPrev) >= Math.abs(calcMotRot)) break;
            control.PauseUntilTime(currTime, 10); // Ожидание выполнения цикла
        }
        // Команды для остановки не нужно, в этом и смысл функции
    }

}