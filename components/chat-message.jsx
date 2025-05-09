import { cn } from "@/lib/utils"

export function ChatMessage({ message, isCurrentUser, roleBadge }) {
  const isSystem = message.userId === "system"

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  if (isSystem) {
    return (
      <div className="my-2 text-center">
        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{message.content}</span>
      </div>
    )
  }

  return (
    <div className={cn("flex gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
      {!isCurrentUser && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {message.username.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="max-w-[80%]">
        {!isCurrentUser && (
          <div className="mb-1 flex items-center text-xs font-medium">
            {message.username}
            {roleBadge}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            {message.content}
          </div>
          <div className={cn("text-xs text-muted-foreground", isCurrentUser ? "text-right" : "text-left")}>
            {formattedTime}
          </div>
        </div>
      </div>

      {isCurrentUser && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {message.username.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}
