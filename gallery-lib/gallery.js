const galleryClass = 'gallery';
const galleryWrapperClass = 'gallery-wrapper';
const galleryWrapperSlideClass = 'gallery-slide';


class Gallery {
	constructor(el, options = {}) {
		this.containerNode = el;
		this.size = el.childElementCount;
		this.currentSlide = 0;

		this.manageHTML = this.manageHTML.bind(this);
		this.setParameters = this.setParameters.bind(this);
		this.setEvents = this.setEvents.bind(this);
		this.resizeGallery = this.resizeGallery.bind(this);

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

		this.wrapper.style.width = `${this.size * this.width}px`;
		Array.from(this.slidesNodes).forEach((slidesNode) => {
			slidesNode.style.width = `${this.width}px`
		});
	}

	setEvents () {
		window.addEventListener('resize', debounce(this.resizeGallery));
	}

	resizeGallery () {
		this.setParameters();
		console.log(1111);
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