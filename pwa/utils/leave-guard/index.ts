class LeaveGuard {
  // 外部からアクセス不可能なプライベートプロパティ
  #handler = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = "";
  };

  on(): void {
    window.addEventListener("beforeunload", this.#handler);
  }

  off(): void {
    window.removeEventListener("beforeunload", this.#handler);
  }
}

// クラス自体ではなく、インスタンス化したオブジェクトをexportする
export const leaveGuard = new LeaveGuard();