export type EventHandler<T> = (payload: T) => void

export class EventEmitter<Events> {
  private readonly handlers = new Map<keyof Events, Set<EventHandler<unknown>>>()

  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    let set = this.handlers.get(event)
    if (!set) {
      set = new Set()
      this.handlers.set(event, set)
    }
    set.add(handler as EventHandler<unknown>)
    return () => {
      set!.delete(handler as EventHandler<unknown>)
    }
  }

  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    this.handlers.get(event)?.delete(handler as EventHandler<unknown>)
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.handlers.get(event)
    if (!set) return
    for (const h of set) {
      ;(h as EventHandler<Events[K]>)(payload)
    }
  }

  clear(): void {
    this.handlers.clear()
  }
}
