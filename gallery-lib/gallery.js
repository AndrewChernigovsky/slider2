const galleryClass = 'gallery';
const galleryWrapperClass = 'gallery-wrapper';
const galleryWrapperSlideClass = 'gallery-slide';
const galleryGrabbableClass = 'gallery-grab';

class Gallery {
	constructor(el, options = {}) {
		this.containerNode = el;
		this.size = el.childElementCount;
		this.currentSlide = 2;
		this.currentSlideWasChanged = false;
		this.settings = {
			margin: options.margin || 0
		}

		this.manageHTML = this.manageHTML.bind(this);
		this.setParameters = this.setParameters.bind(this);
		this.setEvents = this.setEvents.bind(this);
		this.resizeGallery = this.resizeGallery.bind(this);
		this.startDrag = this.startDrag.bind(this);
		this.stopDrag = this.stopDrag.bind(this);
		this.dragging = this.dragging.bind(this);
		this.setStylePosition = this.setStylePosition.bind(this);

		this.manageHTML();
		this.setParameters();
		this.setEvents();
		this.resizeGallery();
	}

	manageHTML() {
		this.containerNode.classList.add(galleryClass);
		this.containerNode.innerHTML = `
			<div class="${galleryWrapperClass}">
				${this.containerNode.innerHTML}
			</div>
		`;
		this.wrapper = this.containerNode.querySelector(`.${galleryWrapperClass}`);

		this.slidesNodes = Array.from(this.wrapper.children).map((childNode) =>
			wrapElementByDiv({
				el: childNode,
				className: galleryWrapperSlideClass
			})
		);
	}

	setParameters() {
		const coordsContainer = this.containerNode.getBoundingClientRect();
		this.width = coordsContainer.width;
		this.maximumX = -(this.size - 1) * this.width;
		this.x = -this.currentSlide * this.width;

		this.resetStyleTransition();
		this.wrapper.style.width = `${this.size * (this.width + this.settings.margin)}px`;
		this.setStylePosition();
		Array.from(this.slidesNodes).forEach((slidesNode) => {
			slidesNode.style.width = `${this.width}px`;
			slidesNode.style.marginRight = `${this.settings.margin}px`
		});
	}

	setEvents () {
		this.debounceResizeGallery = debounce(this.resizeGallery);
		window.addEventListener('resize', this.debounceResizeGallery);
		this.wrapper.addEventListener('pointerdown', this.startDrag);
		window.addEventListener('pointerup', this.stopDrag);
		window.addEventListener('pointercancel', this.stopDrag);
	}

	destroyEvents() {
		window.removeEventListener('resize', this.debounceResizeGallery);
		this.wrapper.removeEventListener('pointerdown', this.startDrag);
		window.removeEventListener('pointerup', this.stopDrag);
		window.removeEventListener('pointercancel', this.stopDrag);
	}

	resizeGallery () {
		this.setParameters();
	}

	startDrag(evt) {
		this.currentSlideWasChanged = false;
		this.clickX = evt.pageX;
		this.startX = this.x;
		this.resetStyleTransition();
		this.containerNode.classList.add(galleryGrabbableClass);
		window.addEventListener('pointermove', this.dragging);
	}

	stopDrag () {
		window.removeEventListener('pointermove', this.dragging);
		this.containerNode.classList.remove(galleryGrabbableClass);
		this.x = - this.currentSlide * (this.width + this.settings.margin);
		this.setStylePosition();
		this.setStyleTransition();
	}

	dragging (evt) {
		this.dragX = evt.pageX;
		const dragShift = this.dragX - this.clickX;
		const easing = dragShift / 5;
		this.x = Math.max(Math.min(this.startX + dragShift, easing), this.maximumX + easing);
		this.setStylePosition();

		if (
			dragShift > 20 &&
			dragShift > 0 &&
			!this.currentSlideWasChanged &&
			this.currentSlide > 0
		) {
			this.currentSlideWasChanged = true;
			this.currentSlide = this.currentSlide - 1;
		}

		if (
			dragShift < -20 &&
			dragShift < 0 &&
			!this.currentSlideWasChanged &&
			this.currentSlide < this.size - 1
		) {
			this.currentSlideWasChanged = true;
			this.currentSlide = this.currentSlide + 1;
		}
	}

	setStylePosition() {
		this.wrapper.style.transform = `translate3d(${this.x}px, 0, 0)`;
	}

	setStyleTransition () {
		this.wrapper.style.transition = `all 0.25s ease 0s`;
	}

	resetStyleTransition () {
		this.wrapper.style.transition = `all 0s ease 0s`;
	}
}

function wrapElementByDiv({el, className}) {
	const wrapperNode = document.createElement('div');
	wrapperNode.classList.add(className);

	el.parentNode.insertBefore(wrapperNode, el);
	wrapperNode.appendChild(el);

	return wrapperNode
}

function debounce (func, time = 100) {
	let timer;
	return function (event) {
		clearTimeout(timer);
		timer = setTimeout(func, time, event);
	}
}