class Zoom {
  constructor(element) {
    this.element = element;
    this.zoomFactor = 2; // Adjust zoom factor as needed
    this.init();
  }

  init() {
    this.element.addEventListener("mouseenter", () => {
      this.zoomIn();
    });

    this.element.addEventListener("mouseleave", () => {
      this.zoomOut();
    });
  }

  zoomIn() {
    this.element.style.transition = "transform 0.5s";
    this.element.style.transform = `scale(${this.zoomFactor})`;
  }

  zoomOut() {
    this.element.style.transition = "transform 0.5s";
    this.element.style.transform = "scale(1)";
  }
}
