/**
 * Пользовательские блоки
 */
namespace custom {

    /**
     * Настройка функций.
     * @param startupScreen экран при старте, eg: 0
     */
    export function FunctionsTune(startupScreen: number = 0) {
        const LOOP_DELAY = 10; // Задержка цикла
        const LINE_SCROLL_TRESHOLD = 6; // Начинать скролл параметров с строки 
        const BTN_PRESS_LOOP_DELAY = 150; // Задержка в цикле при нажатии
        let paramIncrease = false, paramDecrease = false; // Переменные состояния кнопок/влево вправо при изменении коэффиента
        const REG_COEFFICIENT_STEP_NAMES: string[] = ["Kp_step", "Ki_step", "Kd_step"];
        // Пользовательские значения
        const HEADERS: string[] = [ // Текст шапки страниц регуляторов
            "LineFollow",
        ];
        const SCREEN_N = HEADERS.length; // Количество экранов с регуляторами
        const PARAMS_NAMES: string[][] = [
            ["Kp", "Ki", "Kd", "HR", "LW_SPEED"],
        ];
        const SCREEN_WHITH_PID: boolean[] = [true, true, true, true, true, true, true, false, false, false, false, false, false];
        let PARAMS_VALUES: number[][] = [ // Коэффициенты, оторажаемые на экране
            // [LW_KP_2S, LW_KI_2S, LW_KD_2S, LW_SPEED],
            [0, 0, 0, 0],
        ];
        let PARAMS_VALUES_H: number[][] = [ // Размер шагов для коэффициентов
            [0.05, 0.001, 0.1, 5],
        ];
        let PARAMS_VALUES_MIN: number[][] = [ // Минимальные размеры параметров
            [0, 0, 0, 5],
        ];
        let PARAMS_VALUES_MAX: number[][] = [ // Максимальные значения параметров
            [100, 100, 100, 100],
        ];

        let screen = Math.constrain(startupScreen, 0, SCREEN_N - 1);
        let cursor = 0; // Крусор (выделенная строка)
        let confirm = false; // Подтвержден ли курсор (строка) или нет
        let scroll = 0; // Переменная хранение числа скролла
        let screenChanged = false; // Переменная о смене экрана

        // Защита от бага, что запуск функции по кнопке смещает курсор
        //pauseUntil(() => brick.buttonUp.wasPressed() || brick.buttonDown.wasPressed() || brick.buttonLeft.wasPressed() || brick.buttonRight.wasPressed() || brick.buttonEnter.wasPressed());
        //console.log("cursor: " + cursor + ", PARAMS_VALUES[" + screen + "][" + (cursor - 1) + "]: " + PARAMS_VALUES[screen][cursor - 1]);
        // Цикл бработки
        while (true) {
            brick.clearScreen(); // Очищаем экран
            const screenParamNum = PARAMS_NAMES[screen].filter(el => el !== "HR").length; // Количество пользовательских параметров
            const totalStrNum = (SCREEN_WHITH_PID[screen] ? 6 : 2) + screenParamNum - 1; // Общее количество кликабельных строк c параметрами
            if (screenChanged) { // Экран на прошлой итеррации цикла был изменён?
                if (cursor > totalStrNum) cursor = totalStrNum; // Если позиция курсора была дальше, чем общее количество строк, тогда курсор ставим на последнюю строку
                screenChanged = false;
            }
            let strPrint = 1; // Строка печати
            let paramLine = 0; // Линия с параметром
            brick.printString((screen + 1) + ") " + HEADERS[screen], strPrint); // Шапка выводится всегда
            strPrint++;
            brick.showString("=============================", strPrint);
            strPrint++;
            if ((strPrint - scroll) > 2) brick.showString((cursor == paramLine ? "> " : "") + "BREAK FOR TEST", strPrint - scroll);
            strPrint++, paramLine++;
            if ((strPrint - scroll) > 2) brick.showString("-----------------------------", strPrint - scroll);
            strPrint++;
            for (let i = 0, strOffset = 0; i < PARAMS_NAMES[screen].length; i++) {
                if (PARAMS_NAMES[screen][i] != "HR") { // Если не линия разделения
                    if ((strPrint - scroll) > 2) {
                        brick.showValue((cursor == paramLine ? (confirm ? ">>> " : "> ") : "") + PARAMS_NAMES[screen][i], PARAMS_VALUES[screen][i - strOffset], strPrint - scroll);
                    }
                    paramLine++;
                } else { // Иначе линия для отделения
                    if ((strPrint - scroll) > 2) brick.showString("-----------------------------", strPrint - scroll);
                    strOffset++;
                }
                strPrint++; // Увеличиваем строку для печати
            }

            if ((strPrint - scroll) > 2) { brick.showString("-----------------------------", strPrint - scroll); strPrint++; }
            if ((strPrint - scroll) > 2) { brick.showString((cursor == paramLine ? "> " : "") + "BREAK FOR TEST", strPrint - scroll); strPrint++ }
            paramLine++;
            if (SCREEN_WHITH_PID[screen]) { // Если экран с ПИД регулятором, тогда выводить ещё размеры шагов коэффицентов
                if ((strPrint - scroll) > 2) { brick.showString("-----------------------------", strPrint - scroll); strPrint++; }
                for (let i = 0; i < 3; i++) {
                    if ((strPrint - scroll) > 2) { brick.showValue((cursor == paramLine ? (confirm ? ">>> " : "> ") : "") + REG_COEFFICIENT_STEP_NAMES[i], PARAMS_VALUES_H[screen][i], strPrint - scroll); strPrint++; }
                    paramLine++;
                }
                if ((strPrint - scroll) > 2) { brick.showString("-----------------------------", strPrint - scroll); strPrint++; }
                if ((strPrint - scroll) > 2) brick.showString((cursor == paramLine ? "> " : "") + "BREAK FOR TEST", strPrint - scroll);
            }
            // Если активно изменение
            if (confirm) {
                // Фиксируем о необходимости изменить параметр
                if (brick.buttonLeft.isPressed()) paramDecrease = true; // Нажатие влево - уменьшаем число
                else if (brick.buttonRight.isPressed()) paramIncrease = true; // Нажатие вправо - увеличиваем число
                else paramDecrease = false, paramIncrease = false; // Если нажатий нет
                if (paramDecrease || paramIncrease) { // Изменяем коэффициент
                    PARAMS_VALUES[screen][cursor - 1] = Math.constrain((paramDecrease ? PARAMS_VALUES[screen][cursor - 1] - PARAMS_VALUES_H[screen][cursor - 1] : PARAMS_VALUES[screen][cursor - 1] + PARAMS_VALUES_H[screen][cursor - 1]), PARAMS_VALUES_MIN[screen][cursor - 1], PARAMS_VALUES_MAX[screen][cursor - 1]);
                    if (cursor == (screenParamNum + 2)) Math.constrain(PARAMS_VALUES_H[screen][0] = (paramDecrease ? PARAMS_VALUES_H[screen][0] - 0.01 : PARAMS_VALUES_H[screen][0] + 0.01), 0, 1);
                    else if (cursor == (screenParamNum + 3)) Math.constrain(PARAMS_VALUES_H[screen][1] = (paramDecrease ? PARAMS_VALUES_H[screen][1] - 0.001 : PARAMS_VALUES_H[screen][1] + 0.001), 0, 1);
                    else if (cursor == (screenParamNum + 4)) Math.constrain(PARAMS_VALUES_H[screen][2] = (paramDecrease ? PARAMS_VALUES_H[screen][2] - 0.01 : PARAMS_VALUES_H[screen][2] + 0.01), 0, 1);
                    loops.pause(BTN_PRESS_LOOP_DELAY);
                    continue;
                }
            } else { // Если изменение не активно
                if (brick.buttonLeft.wasPressed() && control.timer1.millis() >= 100) {
                    screenChanged = true;
                    if (screen > 0) screen--;
                    else screen = SCREEN_N - 1;
                    control.runInParallel(function () { music.playTone(Note.C, 50); }); // Сигнал о переключении экрана
                } else if (brick.buttonRight.wasPressed() && control.timer1.millis() >= 100) {
                    screenChanged = true;
                    if (screen < SCREEN_N - 1) screen++;
                    else screen = 0;
                    control.runInParallel(function () { music.playTone(Note.C, 50); }); // Сигнал о переключении экрана
                }
            }
            if (brick.buttonUp.wasPressed()) { // Если нажали кнопку вверх
                if (confirm) { // Если изменение было активно
                    confirm = !confirm; // Отключаем подтверждение изменения, если изменение было активно
                    control.runInParallel(function () { music.playTone(Note.F, 50); }); // Сигнал
                }
                if (cursor > 0) { // Изменить курсор, если значение больше первой строке с числом на экране
                    cursor--;
                    if (cursor >= LINE_SCROLL_TRESHOLD - 1) scroll--;
                    else scroll = 0;
                } else { // Иначе ставим курсор в конец и устанавливаем скролл на последнюю строку
                    cursor = totalStrNum;
                    scroll = screenParamNum + 1;
                }
            } else if (brick.buttonDown.wasPressed()) { // Если нажали кнопку вниз
                if (confirm) { // Если изменение было активно
                    confirm = !confirm; // Отключаем подтверждение изменения, если изменение было активно
                    control.runInParallel(function () { music.playTone(Note.F, 50); }); // Сигнал
                }
                if (cursor < totalStrNum) { // Изменить курсор, если значение меньше количеству строк с значениями на экране
                    cursor++;
                    if (cursor >= LINE_SCROLL_TRESHOLD - 1) scroll++;
                    else scroll = 0;
                } else { // Иначе ставим курсор в начало и убираем скролл
                    cursor = 0;
                    scroll = 0;
                }
            }
            // Обрабатываем нажатие ENTER
            if (brick.buttonEnter.wasPressed()) {
                if (cursor == 0 || cursor == (screenParamNum + 1) || cursor == totalStrNum) { // Нажали на строку BREAK FOR TEST?
                    control.runInParallel(function () { music.playTone(Note.D, 100); }); // Сигнал, что было запущено
                    // Запускаем выполнение теста
                    if (screen == 0) {
                        // LW_KP_2S = PARAMS_VALUES[screen][0];
                        // LW_KI_2S = PARAMS_VALUES[screen][1];
                        // LW_KD_2S = PARAMS_VALUES[screen][2];
                        // LW_SPEED = PARAMS_VALUES[screen][3];
                        motions.LineFollowToIntersaction(AfterMotion.BreakStop);
                    }
                } else { // Если нажали на обычную строку с параметром, то подтверждаем для возможности его изменения
                    if (confirm) control.timer1.reset(); // Костыль от переключения экрана после изменения коэффициента и применения
                    confirm = !confirm; // Измение состояния выбора
                    control.runInParallel(function () { music.playTone(Note.F, 50); }); // Сигнал
                    continue;
                }
            }
            loops.pause(LOOP_DELAY);
        }
    }
}