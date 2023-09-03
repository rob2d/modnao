export class ListNode<T> {
  data: T;
  next: ListNode<T> | null;
  prev: ListNode<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}

export default class LinkedList<T> {
  head: ListNode<T> | null;
  tail: ListNode<T> | null;
  length: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  append(data: T): void {
    const newNode = new ListNode(data);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail!.next = newNode;
      this.tail = newNode;
    }
    this.length++;
  }

  prepend(data: T): void {
    const newNode = new ListNode(data);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head!.prev = newNode;
      this.head = newNode;
    }
    this.length++;
  }

  insertAt(index: number, data: T): void {
    if (index < 0 || index > this.length) {
      throw new Error('Index out of bounds');
    }
    if (index === 0) {
      this.prepend(data);
      return;
    }
    if (index === this.length) {
      this.append(data);
      return;
    }
    const newNode = new ListNode(data);
    let current = this.head;
    for (let i = 0; i < index - 1; i++) {
      current = current!.next;
    }
    newNode.next = current!.next;
    newNode.prev = current;
    current!.next!.prev = newNode;
    current!.next = newNode;
    this.length++;
  }

  removeAt(index: number): void {
    if (index < 0 || index >= this.length) {
      throw new Error('Index out of bounds');
    }
    if (index === 0) {
      this.head = this.head!.next;
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null;
      }
      this.length--;
      return;
    }
    let current = this.head;
    for (let i = 0; i < index; i++) {
      current = current!.next;
    }
    current!.prev!.next = current!.next;
    if (current!.next) {
      current!.next.prev = current!.prev;
    } else {
      this.tail = current!.prev;
    }
    this.length--;
  }

  getAt(index: number): T {
    if (index < 0 || index >= this.length) {
      throw new Error('Index out of bounds');
    }
    let current = this.head;
    for (let i = 0; i < index; i++) {
      current = current!.next;
    }
    return current!.data;
  }

  print(): void {
    const values: T[] = [];
    let current = this.head;
    while (current) {
      values.push(current.data);
      current = current.next;
    }
    console.log(values.join(' <-> '));
  }
}
