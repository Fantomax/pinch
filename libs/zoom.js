function Zoom (zoomViewer, options) {
    var self = this;
    this.options = options;
    this.zoomViewer = zoomViewer;
    this.zoomBody = this.zoomViewer.children[0];
    this.zoomViewer.addEventListener('touchstart', function (e) {
        e.stopPropagation();
        self._zoomStart(e);
    }, false);
    this.scale = 1;
}
Zoom.prototype = {
    _zoomStart: function (e) {
        if (!e.touches || e.touches.length != 2) {
            return;
        }
        var zoomViewer = this.zoomViewer,
            zoomBody = this.zoomBody,
            c1 = Math.abs( e.touches[0].pageX - e.touches[1].pageX ),
            c2 = Math.abs( e.touches[0].pageY - e.touches[1].pageY),
            clientRect = zoomBody.getBoundingClientRect();
        var self = this;

        this.averX = ((e.touches[0].pageX + e.touches[1].pageX) / 2);
        this.averY = ((e.touches[0].pageY + e.touches[1].pageY) / 2);
        this.startScrollLeft = zoomViewer.scrollLeft;
        this.startScrollTop = zoomViewer.scrollTop;

        this.touchesDistanceStart = Math.sqrt(c1 * c1 + c2 * c2);
        this.startScale = this.scale;
        this.pinching = true;

        this.zoomViewer.addEventListener('touchmove', function(e){
            e.stopPropagation();
            self._zoom(e);
        }, false);
        this.zoomViewer.addEventListener('touchend', function(e){
            self._zoomEnd(e);
        }, false);
        this.zoomViewer.addEventListener('touchcancel', function(e){
            self._zoomEnd(e);
        }, false);
    },
    _zoom: function (e) {
        if (!e.touches || e.touches.length !== 2 || !this.pinching) {
            return;
        }
        var c1 = Math.abs( e.touches[0].pageX - e.touches[1].pageX ),
            c2 = Math.abs( e.touches[0].pageY - e.touches[1].pageY ),
            distance = Math.sqrt( c1 * c1 + c2 * c2 ),
            scale = 1 / this.touchesDistanceStart * distance * this.startScale,
            zoomViewer = this.zoomViewer;

        if(!scale || Math.abs(this.touchesDistanceStart - distance) < 20) {
            return;
        }

        this.scaled = true;

        if ( scale < this.options.zoomMin ) {
            scale = 0.5 * this.options.zoomMin * Math.pow(2.0, scale / this.options.zoomMin);
        } else if ( scale > this.options.zoomMax ) {
            scale = 2.0 * this.options.zoomMax * Math.pow(0.5, this.options.zoomMax / scale);
        }

        zoomViewer.children[0].style.transform = 'scale(' + scale + ') translateZ(0)';
        zoomViewer.children[0].style['-webkit-transform'] = 'scale(' + scale + ') translateZ(0)';
        this.scale = scale;
    },
    _zoomEnd: function (e) {
        if (!e.touches || e.touches.length === 2 || !this.pinching) {
            return;
        }
        var deltaScale,
            pdfViewer = this.zoomViewer;

        if ( this.scale > this.options.zoomMax ) {
            this.scale = this.options.zoomMax;
        } else if ( this.scale < this.options.zoomMin ) {
            this.scale = this.options.zoomMin;
        }
        deltaScale = (this.scale / this.startScale);
        this.zoomViewer.classList.remove('without-scroll');

        pdfViewer.children[0].style.transform = 'scale(' + this.scale + ') translateZ(0)';
        pdfViewer.children[0].style['-webkit-transform'] = 'scale(' + this.scale + ') translateZ(0)';
        this.pinching = false;
    }
};
