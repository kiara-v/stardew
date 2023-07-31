const UPDATE_INTERVAL = 20;
const UPDATES_PER_SECOND = Math.round(1000 / 20);

const ANIMATION_STYLE_RUN = { animationPlayState: 'running' };
const ANIMATION_STYLE_PAUSE = { animationPlayState: 'paused' };

const FISHING_SLIDE_MAX_BOTTOM = 320;
const FISHING_SLIDE_MIN_BOTTOM = 0;
const FISHING_SLIDE_HEIGHT = 84;
const FISHING_SLIDE_MAX_ACC = 8;

const FISH_MAX_BOTTOM = 367;
const FISH_MIN_BOTTOM = 10;

const FISH_MAX_MOVE_SECONDS = 3;
const FISH_MIN_MOVE_SECONDS = 0.5;

const FISH_MIN_ACC = 4;
const FISH_MAX_ACC = 12;

const FISH_MIN_DRIFT = 0.01;
const FISH_MAX_DRIFT = 0.3;

const FISH_MIN_ACC_FALLOFF = 0.1;
const FISH_MAX_ACC_FALLOFF = 0.4;

const FISH_MID = 17;

class App extends React.Component {
	render() {
		return (
			<div className="app">
				<FishingGui/>
			</div>
		)
	}
}

class FishingGui extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			reelStyle: ANIMATION_STYLE_PAUSE,
		};
		
		this.updateInterval = null;
		this.reeling = false;
		
		this.slideBottom = FISHING_SLIDE_MIN_BOTTOM;
		this.slideAcc = 0;
		
		this.fishBottom = FISH_MIN_BOTTOM;
		
		this.progressPercent = 50;
		
		this.onFish = false;
		
		this.fishTicks = 0;
		this.fishAcc = 0;
		this.fishAccFalloff = 0;
		this.fishNextUpdate = 0;
		this.fishReverse = false;
		this.fishDrift = 0;
		
		this.setFishMovement();
				
		this.slideRef = React.createRef();
		this.fishRef = React.createRef();
		this.progressRef = React.createRef();
	}
	componentDidMount() {
		window.addEventListener('mousedown', this.mouseDownHandler);
		window.addEventListener('mouseup', this.mouseUpHandler);
		
		this.updateInterval = setInterval(this.updateHandler, UPDATE_INTERVAL);
		
	}
	componentWillUnmount() {
		window.removeEventListener('mousedown', this.mouseDownHandler);
		window.removeEventListener('mouseup', this.mouseUpHandler);
		
		if(this.updateInterval) {
			clearInterval(this.updateInterval);
		}
	}
	mouseDownHandler = (event) => {
		if(event.button === 0) {
			this.setState({ reelStyle: ANIMATION_STYLE_RUN });
			this.reeling = true;
		}
	}
	mouseUpHandler = (event) => {
		this.setState({ reelStyle: ANIMATION_STYLE_PAUSE });
		this.reeling = false;
	}
	updateHandler = () => {
		try {
			this.updateSlide();
			this.updateFish();
		}	catch(e) {
			if(this.updateInterval) {
				clearInterval(this.updateInterval);
				console.error('[FISHING]: Stopped update interval due to error: ' + e.message)
			}
		}
		
	}
	setFishMovement = () => {
		this.fishTicks = 0;
		
		this.fishAcc = Math.round(getRandomArbitrary(FISH_MIN_ACC, FISH_MAX_ACC));
		this.fishAccFalloff = getRandomArbitrary(FISH_MIN_ACC_FALLOFF, FISH_MAX_ACC_FALLOFF);
		
		this.fishNextUpdate = getFishInterval();
		
		this.fishReverse = coinToss();

		if(this.fishBottom === FISH_MAX_BOTTOM) {
			this.fishReverse = true;
		} else if(this.fishBottom === FISH_MIN_BOTTOM) {
			this.fishReverse = false;
		}
		
		this.fishDrift = getRandomArbitrary(FISH_MIN_DRIFT, FISH_MAX_DRIFT);
		if(coinToss()) {
			this.fishDrift *= -1;
		}
	}
	updateFish = () => {
		this.fishTicks++;
		if(this.fishTicks > this.fishNextUpdate) {
			this.setFishMovement();
		}
		
		if(!this.fishReverse) {
			this.fishBottom += this.fishAcc;
		} else {
			this.fishBottom -= this.fishAcc;
		}
		
		this.fishBottom += this.fishDrift;
		
		if(this.fishAcc > 0) {
			if(this.fishAcc - this.fishAccFalloff > 0) {
				this.fishAcc -= this.fishAccFalloff;
			} else {
				this.fishAcc = 0;
			}
		}
		
		this.fishBottom = bindValue(this.fishBottom, FISH_MIN_BOTTOM, FISH_MAX_BOTTOM);
		
		
		
		updateStyleBottom(this.fishRef, this.fishBottom);
	}
	updateSlide = () => {
		if(this.reeling) {
			if(this.slideBottom <= FISHING_SLIDE_MAX_BOTTOM) {
				
				if(this.slideBottom + this.slideAcc > FISHING_SLIDE_MAX_BOTTOM) {
					this.slideBottom = FISHING_SLIDE_MAX_BOTTOM;
					this.slideAcc = 0;
				} else if(this.slideBottom + this.slideAcc < FISHING_SLIDE_MIN_BOTTOM){
					this.slideBottom = 0;
					this.slideAcc = 0;
				} else {
					this.slideBottom += this.slideAcc;

					if(this.slideAcc < FISHING_SLIDE_MAX_ACC) {
						this.slideAcc++;
					}					
				}
			} else if(this.slideAcc !== 0) {
				this.slideAcc = 0;
			}
		} else {
			if(this.slideBottom >= FISHING_SLIDE_MIN_BOTTOM) {
				if(this.slideBottom + this.slideAcc < FISHING_SLIDE_MIN_BOTTOM) {
					this.slideBottom = 0;
					this.slideAcc = 0;
				} else if(this.slideBottom + this.slideAcc > FISHING_SLIDE_MAX_BOTTOM) {
					this.slideBottom = FISHING_SLIDE_MAX_BOTTOM;
					this.slideAcc = 0;
				} else {
					this.slideBottom += this.slideAcc;

					if(this.slideAcc > -FISHING_SLIDE_MAX_ACC) {
						this.slideAcc--;
					}
				}
			} else if(this.slideAcc !== 0) {
				this.slideAcc = 0;
			}
		}
		
		updateStyleBottom(this.slideRef, this.slideBottom);
		const { current } = this.slideRef;

		if(checkOnFish(this.fishBottom, this.slideBottom)) {
			
			if(!this.onFish) {				
				this.onFish = true;
				this.slideRef.current.style.opacity = 1;
				this.slideRef.current.className = 'fishing-slide';
				updateClassname(this.slideRef, 'fishing-slide')

				updateClassname(this.fishRef, 'fas fa-fish fishing-icon shake');
			}

			if(this.progressPercent < 100) {
				this.progressPercent += 0.5;
				updateStyleHeight(this.progressRef, this.progressPercent);
				updateProgressColor(this.progressRef, this.progressPercent);
			}
		} else if(this.progressPercent > 0) {
			
			if(this.onFish) {
				this.onFish = false;
				
				this.slideRef.current.style.opacity = 0.8;
				updateClassname(this.slideRef, 'fishing-slide strobing')

				updateClassname(this.fishRef, 'fas fa-fish fishing-icon')
			}

			this.progressPercent -= 0.5;
			updateStyleHeight(this.progressRef, this.progressPercent);
			updateProgressColor(this.progressRef, this.progressPercent);
		}
	}
	render() {
		const { reelStyle, slideStyle } = this.state;
		
		return (
			<div className="fishing-wrapper">
				<div className="fishing-pole-wrapper">
					<div className="fishing-pole">
						<div className="fishing-pole-segment"/>
						<div className="fishing-pole-segment"/>
						<div className="fishing-pole-segment"/>
						<div className="fishing-pole-segment"/>
						<div className="fishing-pole-segment"/>
						<div className="fishing-pole-segment"/>
						<div className="fishing-pole-segment"/>
						<div className="fishing-pole-segment"/>
					</div>
					<div className="fishing-pole-handle"/>
					<div className="fishing-pole-reel">
						<div className="fishing-pole-reel-handle rotating" style={reelStyle}/>
					</div>
				</div>
				<div className="bamboo-wrapper">
					<div className="bamboo-col">
						<div className="bamboo-segment"/>
						<div className="bamboo-segment"/>
						<div className="bamboo-segment"/>
						<div className="bamboo-segment"/>
						<div className="bamboo-segment"/>
					</div>
					<div className="fishing-slide-wrapper">
						<div className="bamboo-row"/>
						<div className="fishing-slide strobing" ref={this.slideRef}/>
						<i className="fas fa-fish fishing-icon" ref={this.fishRef}/>
						<div className="bamboo-row"/>
					</div>
					<div className="bamboo-col">
						<div className="bamboo-segment"/>
						<div className="bamboo-segment"/>
						<div className="bamboo-segment"/>
						<div className="bamboo-segment"/>
						<div className="bamboo-segment"/>
					</div>
				</div>
				<div className="fishing-progress-wrapper">
					<div className="fishing-progress-bar" ref={this.progressRef}/>
				</div>
			</div>
		)
	}
}

function checkOnFish(fishBottom, slideBottom) {
	const fishMid = fishBottom + FISH_MID; 
	return slideBottom < fishMid && slideBottom + FISHING_SLIDE_HEIGHT > fishMid;
}

function updateStyleBottom(ref, bottom) {
	ref.current.style.bottom = `${bottom}px`;
}

function updateStyleHeight(ref, height) {
	ref.current.style.height = `${height}%`;
}

function updateClassname(ref, className) {
	ref.current.className = className;
}

function updateProgressColor(ref, percent) {
	let r = 255, g = 255;
	if(percent <= 50) {
		g = mapValue(percent, 0, 50, 0, 255);
	} else {
		r = mapValue(percent, 51, 100, 255, 0);
	}
	ref.current.style.background = `rgb(${r}, ${g}, 0)`;
}

function bindValue(value, min, max) {
	if(value < min) {
		return min;
	} else if(value > max) {
		return max;
	}
	return value;
}

function getFishInterval() {
	return UPDATES_PER_SECOND * getRandomArbitrary(FISH_MIN_MOVE_SECONDS, FISH_MAX_MOVE_SECONDS);
}

function mapValue(n, start1, stop1, start2, stop2) {
  return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function coinToss() {
	return (Math.random() < 0.5);
}

ReactDOM.render(<App/>, document.getElementById('root'));
