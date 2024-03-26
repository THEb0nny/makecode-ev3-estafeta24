namespace motions {

    export function LineFollowToIntersaction(debug: boolean = false) {
        automation.pid1.setGains(LW_KP_2S, LW_KI_2S, LW_KD_2S); // Установка значений регулятору
        automation.pid1.setControlSaturation(-200, 200); // Ограничения ПИДа
        automation.pid1.reset(); // Сброс ПИДа
        let prevTime = 0; // Переменная предыдущего времения для цикла регулирования
        while (!brick.buttonEnter.wasPressed()) { // Остановка по нажатию
            let currTime = control.millis();
            let dt = currTime - prevTime;
            prevTime = currTime;
            let refRawLCS = L_CS.light(LightIntensityMode.ReflectedRaw); // Сырое значение с левого датчика цвета
            let refRawRCS = R_CS.light(LightIntensityMode.ReflectedRaw); // Сырое значение с правого датчика цвета
            let refLCS = sensors.GetNormRefValCS(refRawLCS, B_RAW_REF_LCS, W_RAW_REF_LCS); // Нормализованное значение с левого датчика цвета
            let refRCS = sensors.GetNormRefValCS(refRawRCS, B_RAW_REF_RCS, W_RAW_REF_RCS); // Нормализованное значение с правого датчика цвета
            if (refLCS < LW_TRESHOLD && refRCS < LW_TRESHOLD) break;
            let error = refLCS - refRCS; // Расчёт ошибки
            automation.pid1.setPoint(error); // Передаём ошибку регулятору
            let u = automation.pid1.compute(dt, 0); // Вычисляем и записываем значение с регулятора
            motions.ChassisControl(u, LW_SPEED); // Передаём управляющее воздействие моторам
            if (debug) { // Отладка
                brick.clearScreen();
                brick.showValue("refLCS", refLCS, 1);
                brick.showValue("refRCS", refRCS, 2);
                brick.showValue("error", error, 3);
                brick.showValue("u", u, 4);
                brick.showValue("dt", dt, 12);
            }
            control.PauseUntilTime(currTime, 10); // Ожидание выполнения цикла
        }
        music.PlayToneInParallel(262, BeatFraction.Quarter); // Сообщить о выполнении
        CHASSIS_L_MOTOR.stop(); CHASSIS_R_MOTOR.stop();
    }

    export function LineFollowToDist(dist: number, speed: number, actionAfterMotion: AfterMotion, debug: boolean = false) {
        let lMotEncPrev = CHASSIS_L_MOTOR.angle(), rMotEncPrev = CHASSIS_R_MOTOR.angle(); // Значения с энкодеров моторов до запуска
        let calcMotRot = (dist / (Math.PI * WHEELS_D)) * 360; // Дистанция в мм, которую нужно проехать по линии

        automation.pid1.setGains(LW_KP_2S, LW_KI_2S, LW_KD_2S); // Установка коэффицентов  ПИД регулятора
        automation.pid1.setControlSaturation(-200, 200); // Установка интервала ПИД регулятора
        automation.pid1.reset(); // Сброс ПИД регулятора

        let prevTime = 0; // Переменная предыдущего времения для цикла регулирования
        while (true) { // Пока моторы не достигнули градусов вращения
            let currTime = control.millis(); // Текущее время
            let dt = currTime - prevTime; // Время за которое выполнился цикл
            prevTime = currTime; // Новое время в переменную предыдущего времени
            let lMotEnc = CHASSIS_L_MOTOR.angle(), rMotEnc = CHASSIS_R_MOTOR.angle(); // Значения с энкодеров моторы
            if (Math.abs(lMotEnc - lMotEncPrev) >= Math.abs(calcMotRot) || Math.abs(rMotEnc - rMotEncPrev) >= Math.abs(calcMotRot)) break;
            let refRawLCS = L_CS.light(LightIntensityMode.ReflectedRaw); // Сырое значение с левого датчика цвета
            let refRawRCS = R_CS.light(LightIntensityMode.ReflectedRaw); // Сырое значение с правого датчика цвета
            let refLCS = sensors.GetNormRefValCS(refRawLCS, B_RAW_REF_LCS, W_RAW_REF_LCS); // Нормализованное значение с левого датчика цвета
            let refRCS = sensors.GetNormRefValCS(refRawRCS, B_RAW_REF_RCS, W_RAW_REF_RCS); // Нормализованное значение с правого датчика цвета
            let error = refLCS - refRCS; // Ошибка регулирования
            automation.pid1.setPoint(error); // Передать ошибку регулятору
            let U = automation.pid1.compute(dt, 0); // Управляющее воздейвствие
            //CHASSIS_MOTORS.steer(U, speed); // Команда моторам
            motions.ChassisControl(U, speed);
            if (debug) {
                brick.clearScreen(); // Очистка экрана
                brick.printValue("refLCS", refLCS, 1);
                brick.printValue("refRCS", refRCS, 2);
                brick.printValue("error", error, 3);
                brick.printValue("U", U, 4);
                brick.printValue("dt", dt, 12);
            }
            control.PauseUntilTime(currTime, 10); // Ожидание выполнения цикла
        }
        music.PlayToneInParallel(262, BeatFraction.Half); // Издаём сигнал завершения
        custom.ActionAfterMotion(speed, actionAfterMotion);
    }

}