'use strict';

WaveSurfer.Drawer = {
    init: function (container, params) {
        this.container = container;
        this.params = params;

        this.width = 0;
        this.height = params.height * this.params.pixelRatio;
        this.containerWidth = this.container.clientWidth;

        this.lastPos = 0;

        this.createWrapper();
        this.createElements();
    },

    createWrapper: function () {
        this.wrapper = this.container.appendChild(
            document.createElement('wave')
        );
        this.style(this.wrapper, {
            display: 'block',
            position: 'relative',
            userSelect: 'none',
            webkitUserSelect: 'none',
            height: this.params.height + 'px'
        });

        if (this.params.fillParent || this.params.scrollParent) {
            this.style(this.wrapper, {
                width: '100%',
                overflowX: this.params.hideScrollbar ? 'hidden' : 'auto',
                overflowY: 'hidden'
            });
        }

        this.setupWrapperEvents();
    },

    handleEvent: function (e) {
        e.preventDefault();
        var bbox = this.wrapper.getBoundingClientRect();
        return ((e.clientX - bbox.left + this.wrapper.scrollLeft) / this.scrollWidth) || 0;
    },

    setupWrapperEvents: function () {
        var my = this;
        var drag = {};

        this.wrapper.addEventListener('mousedown', function (e) {
            var scrollbarHeight = my.wrapper.offsetHeight - my.wrapper.clientHeight;
            if (scrollbarHeight != 0) {
                // scrollbar is visible.  Check if click was on it
                var bbox = my.wrapper.getBoundingClientRect();
                if (e.clientY >= bbox.bottom - scrollbarHeight) {
                    // ignore mousedown as it was on the scrollbar
                    return;
                }
            }

            if (my.params.interact) {
                my.fireEvent('mousedown', my.handleEvent(e), e);
            }
            drag.startPercentage = my.handleEvent(e);
        });

        this.wrapper.addEventListener('mouseup', function (e) {
            if (my.params.interact) {
                my.fireEvent('mouseup', e);
            }
        });

        this.wrapper.addEventListener('dblclick', function(e) {
            if (my.params.interact || my.params.dragSelection) {
                if (
                    e.target.tagName.toLowerCase() == 'handler' &&
                        !e.target.classList.contains('selection-wavesurfer-handler')
                ) {
                    my.fireEvent('mark-dblclick', e.target.parentNode.id);
                }
                else{
                    my.fireEvent('drag-clear');
                }
            }
        });

        var onMouseUp = function (e) {
            drag.startPercentage = drag.endPercentage = null;
        };
        document.addEventListener('mouseup', onMouseUp);
        this.on('destroy', function () {
            document.removeEventListener('mouseup', onMouseUp);
        });

        this.wrapper.addEventListener('mousemove', WaveSurfer.util.throttle(function (e) {
            e.stopPropagation();
            if (drag.startPercentage != null) {
                drag.endPercentage = my.handleEvent(e);
                if (my.params.interact && my.params.dragSelection) {
                    my.fireEvent('drag', drag);
                }
            }
        }, 30));
    },

    drawPeaks: function (peaks, length) {
        this.resetScroll();
        this.setWidth(length);
        if (this.params.normalize) {
            var max = WaveSurfer.util.max(peaks);
        } else {
            max = 1;
        }
        this.drawWave(peaks, max);
    },

    style: function (el, styles) {
        Object.keys(styles).forEach(function (prop) {
            if (el.style[prop] != styles[prop]) {
                el.style[prop] = styles[prop];
            }
        });
        return el;
    },

    resetScroll: function () {
        this.wrapper.scrollLeft = 0;
    },

    recenter: function (percent) {
        var position = this.scrollWidth * percent;
        this.recenterOnPosition(position, true);
    },

    recenterOnPosition: function (position, immediate) {
        var scrollLeft = this.wrapper.scrollLeft;
        var half = ~~(this.containerWidth / 2);
        var target = position - half;
        var offset = target - scrollLeft;

        // if the cursor is currently visible...
        if (!immediate && offset >= -half && offset < half) {
            // we'll limit the "re-center" rate.
            var rate = 5;
            offset = Math.max(-rate, Math.min(rate, offset));
            target = scrollLeft + offset;
        }

        if (offset != 0) {
            this.wrapper.scrollLeft = target;
        }
    },

    getWidth: function () {
        return Math.round(this.containerWidth * this.params.pixelRatio);
    },

    setWidth: function (width) {
        if (width == this.width) { return; }

        this.width = width;
        this.scrollWidth = ~~(this.width / this.params.pixelRatio);
        this.containerWidth = this.container.clientWidth;

        if (this.params.fillParent || this.params.scrollParent) {
            this.style(this.wrapper, {
                width: ''
            });
        } else {
            this.style(this.wrapper, {
                width: this.scrollWidth + 'px'
            });
        }

        this.updateWidth();
    },

    progress: function (progress) {
        var minPxDelta = 1 / this.params.pixelRatio;
        var pos = Math.round(progress * this.width) * minPxDelta;

        if (pos < this.lastPos || pos - this.lastPos >= minPxDelta) {
            this.lastPos = pos;

            if (this.params.scrollParent) {
                var newPos = ~~(this.scrollWidth * progress);
                this.recenterOnPosition(newPos);
            }

            this.updateProgress(progress);
        }
    },

    destroy: function () {
        this.unAll();
        this.container.removeChild(this.wrapper);
        this.wrapper = null;
    },

    updateSelection: function (startPercent, endPercent) {
        this.startPercent = startPercent;
        this.endPercent = endPercent;

        this.drawSelection();
    },

    clearSelection: function (mark0, mark1) {
        this.startPercent = null;
        this.endPercent = null;
        this.eraseSelection();
        this.eraseSelectionMarks(mark0, mark1);
    },


    /* Renderer-specific methods */
    createElements: function () {},

    updateWidth: function () {},

    drawWave: function (peaks, max) {},

    clearWave: function () {},

    updateProgress: function (position) {},

    addMark: function (mark) {},

    removeMark: function (mark) {},

    updateMark: function (mark) {},

    addRegion: function (region) {},

    removeRegion: function (region) {},

    updateRegion: function (region) {},

    drawSelection: function () {},

    eraseSelection: function () {},

    eraseSelectionMarks: function (mark0, mark1) {}
};

WaveSurfer.util.extend(WaveSurfer.Drawer, WaveSurfer.Observer);
