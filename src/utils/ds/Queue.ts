class QueueNode<T> {
  constructor(
    public data: T,
    public next: QueueNode<T> | null = null,
    public prev: QueueNode<T> | null = null
  ) {}
}

export default class Queue<T> {
  front: QueueNode<T> | null = null;
  rear: QueueNode<T> | null = null;
  size = 0;

  enqueue(item: T): void {
    const newNode = new QueueNode(item);
    if (this.size === 0) {
      this.front = newNode;
      this.rear = newNode;
    } else {
      newNode.prev = this.rear;
      this.rear!.next = newNode;
      this.rear = newNode;
    }
    this.size++;
  }

  dequeue(): T | undefined {
    if (this.size === 0) {
      return undefined;
    }
    const removedNode = this.front;
    this.front = removedNode!.next;
    if (this.front) {
      this.front.prev = null;
    } else {
      this.rear = null; // If the queue is now empty
    }
    this.size--;
    return removedNode!.data;
  }

  peek(): T | undefined {
    return this.front?.data;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  clear(): void {
    this.front = null;
    this.rear = null;
    this.size = 0;
  }
}

// Example usage:
const queue = new Queue<number>();

queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);

console.log(queue.dequeue()); // Output: 1
console.log(queue.peek()); // Output: 2
console.log(queue.size); // Output: 2

queue.clear();
console.log(queue.isEmpty()); // Output: true
