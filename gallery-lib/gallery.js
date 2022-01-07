const galleryClass = 'gallery';
const galleryWrapperContainerClass = 'gallery-container';
const galleryWrapperClass = 'gallery-wrapper';
const galleryWrapperSlideClass = 'gallery-slide';
const galleryGrabbableClass = 'gallery-grab';
const galleryDotsClass = 'gallery-dots';
const galleryDotClass = 'gallery-dot';
const galleryDotsActiveClass = 'gallery-dot-active';
const galleryNavClass = 'gallery-nav';
const galleryNavLeftClass = 'gallery-nav-left';
const galleryNavRightClass = 'gallery-nav-right';
const galleryNavDisabledClass = 'gallery-nav-disabled';

class Gallery {
	constructor(el, options = {}) {
		this.containerNode = el;
		this.size = el.childElementCount;
		this.currentSlide = 0;
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
		this.clickDots = this.clickDots.bind(this);
		this.moveToLeft = this.moveToLeft.bind(this);
		this.moveToRight = this.moveToRight.bind(this);
		this.changeCurrentSlide = this.changeCurrentSlide.bind(this);
		this.changeActiveDotClass = this.changeActiveDotClass.bind(this);
		this.changeDisabledNav = this.changeDisabledNav.bind(this);

		this.manageHTML();
		this.setParameters();
		this.setEvents();
		this.resizeGallery();
	}

	manageHTML() {
		this.containerNode.classList.add(galleryClass);
		this.containerNode.innerHTML = `
			<div class="${galleryWrapperContainerClass}">
				<div class="${galleryWrapperClass}">
					${this.containerNode.innerHTML}
				</div>
			</div>

			<div class="${galleryNavClass}">
				<button type="button" class="${galleryNavLeftClass}">Left</button>
				<button type="button" class="${galleryNavRightClass}">Right</button>
			</div>
			<div class="${galleryDotsClass}">
			</div>
		`;

		this.wrapperContainerNode = this.containerNode.querySelector(`.${galleryWrapperContainerClass}`);
		this.wrapper = this.containerNode.querySelector(`.${galleryWrapperClass}`);
		this.dotsNode = this.containerNode.querySelector(`.${galleryDotsClass}`);

		this.slidesNodes = Array.from(this.wrapper.children).map((childNode) =>
			wrapElementByDiv({
				el: childNode,
				className: galleryWrapperSlideClass
			})
		);

		this.dotsNode.innerHTML = Array.from(Array(this.size).keys()).map((key) => (
			`<button class="${galleryDotClass} ${key === this.currentSlide ? galleryDotsActiveClass : ''}"></button>`
		)).join('');

		this.dotNodes = this.dotsNode.querySelectorAll(`.${galleryDotClass}`);
		this.navLeft = this.containerNode.querySelector(`.${galleryNavLeftClass}`);
		this.navRight = this.containerNode.querySelector(`.${galleryNavRightClass}`)
	}

	setParameters() {
		const coordsWrapperContainer = this.wrapperContainerNode.getBoundingClientRect();
		this.width = coordsWrapperContainer.width;
		this.maximumX = -(this.size - 1) * this.width;
		this.x = -this.currentSlide * this.width;

		this.resetStyleTransition();
		this.wrapper.style.width = `${this.size * (this.width + this.settings.margin)}px`;
		this.setStylePosition();
		this.changeActiveDotClass();
		this.changeDisabledNav();

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

		this.dotsNode.addEventListener('click', this.clickDots);
		this.navLeft.addEventListener('click', this.moveToLeft);
		this.navRight.addEventListener('click', this.moveToRight);
	}

	destroyEvents() {
		window.removeEventListener('resize', this.debounceResizeGallery);
		this.wrapper.removeEventListener('pointerdown', this.startDrag);
		window.removeEventListener('pointerup', this.stopDrag);
		window.removeEventListener('pointercancel', this.stopDrag);

		this.dotsNode.removeEventListener('click', this.clickDots);
		this.navLeft.removeEventListener('click', this.moveToLeft);
		this.navRight.removeEventListener('click', this.moveToRight);
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
		this.changeCurrentSlide();
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

	clickDots(evt) {
		const dotNode = evt.target.closest("button");
		if (dotNode) {

			let dotNumber;
			for(let i = 0; i < this.dotNodes.length; i++)
				if (this.dotNodes[i] === dotNode) {
					dotNumber = i;
					break;
				}

			dotNumber !== this.currentSlide && (evt = Math.abs(this.currentSlide - dotNumber),
			this.currentSlide = dotNumber,
			this.changeCurrentSlide(evt))
		}
	}

	moveToLeft () {
		if (this.currentSlide <= 0) {
			return;
		}

		this.currentSlide = this.currentSlide - 1;
		this.changeCurrentSlide();
	}

	moveToRight () {
		if (this.currentSlide >= this.size - 1) {
			return;
		}

		this.currentSlide = this.currentSlide + 1;
		this.changeCurrentSlide();
	}

	changeCurrentSlide () {
		this.x = - this.currentSlide * (this.width + this.settings.margin);
		this.setStylePosition();
		this.setStyleTransition();
		this.changeActiveDotClass();
		this.changeDisabledNav();
	}

	changeDisabledNav() {
		if (this.currentSlide <= 0) {
			this.navLeft.classList.add(galleryNavDisabledClass);
		} else {
			this.navLeft.classList.remove(galleryNavDisabledClass);
		}

		if (this.currentSlide >= this.size - 1) {
			this.navRight.classList.add(galleryNavDisabledClass);
		} else {
			this.navRight.classList.remove(galleryNavDisabledClass);
		}
	}

	changeActiveDotClass () {
		for(let i = 0; i < this.dotNodes.length; i++)
			this.dotNodes[i].classList.remove(galleryDotsActiveClass);
		this.dotNodes[this.currentSlide].classList.add(galleryDotsActiveClass);
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
