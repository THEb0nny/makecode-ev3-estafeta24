const enum RobotOrder {
    //% block="ведущий"
    Master,
    //% block="ведомый"
    Slave
}

// Перечисление о вариантах работы манипулятора
const enum ClawState {
    //% block="открыть"
    Open,
    //% block="закрыть"
    Close
}

// Перечисление о типах торможения полный вариант
const enum AfterMotion {
    //% block="прокатка"
    Rolling,
    //% block="плавная прокатка"
    DecelRolling,
    //% block="прокатка без торможения"
    RollingNoStop,
    //% block="тормоз с удержанием"
    BreakStop,
    //% block="тормоз с инерцией"
    NoBreakStop,
    //% block="не тормозить"
    NoStop
}