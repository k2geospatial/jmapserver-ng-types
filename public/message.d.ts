
declare type JAppMessageSeverity = "success" | "info" | "warning" | "error"

declare interface JAppMessage {
    id: string
    text: string
    severity: JAppMessageSeverity
    expired: boolean
    duration: number | null
}

declare interface JAppMessageOptions{
    severity?: JAppMessageSeverity
    duration?: number | null
}