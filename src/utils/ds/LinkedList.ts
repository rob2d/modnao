/* eslint-disable @typescript-eslint/no-non-null-assertion */
export type ListNode<T> = {
  data: T;
  next: ListNode<T> | null;
  prev: ListNode<T> | null;
};

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
    const newNode: ListNode<T> = {
      data,
      next: null,
      prev: null
    } as ListNode<T>;

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

  advanceHead(): void {
    this.head = this.head!.next;
    if (this.head) {
      this.head.prev = null;
    } else {
      this.tail = null;
    }
    this.length--;
  }

  getAt(index: number): T {
    let current = this.head;
    for (let i = 0; i < index; i++) {
      current = current!.next;
    }
    return current!.data;
  }
}
