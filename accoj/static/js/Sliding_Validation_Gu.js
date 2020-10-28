/**
 * jquery plugin -- jquery.Sliding_Validation.js
 * Description: a slideunlock plugin based on jQuery
 * Version: 1.1
 * Author: Gu Shijie
 * created: February 26, 2020
 */
;
(function($, window, document, undefined) {
	function SlidingValidation(append_obj, style, success) {
		this.element_wrapper = false;
		this.success = this.checkFn(success) ? success : function() {};
		this.append_obj = this.checkElm(append_obj) ? append_obj : $('body');
		this.success_count = 0;
		var style_wrapper = {
			position: "relative",
			top: "0px",
			left: "0px",
			slide_block_wrapper_width: "300px",
			slide_block_wrapper_height: "40px",
			slide_block_width: "50px",
			slide_block_height: "100%",
			margin: "0px 0px 0px 0px",
			slider_wrapper_zindex: 10000,
			slider_wrapper_bg: "#e8e8e8",
			slider_bg: "rgb(255,255,255)",
			progress_bg: "rgb(255,184,0)",
			default_text: "请向右滑动滑块",
			default_text_color: "black",
			success_text_color: "white",
			default_text_font_size: "12px",
			success_show_text: "验证成功",
			success_slider_wrapper_bg: "rgb(76,175,80)",
			success_url_icon: "../../static/img/ok.png",
			default_url_icon: "../../static/img/right-arrow.png",
			box_shadow: "1px 1px 5px rgba(0,0,0,0.2)",
			border: "1px solid #ccc"
		};
		this.style = $.extend(style_wrapper, style || {});
		var set_slide_block_option = {
			min_left: 0,
			max_left: parseInt(this.style.slide_block_wrapper_width) - parseInt(this.style.slide_block_width),
			is_ok: false,
			random: parseInt(Math.random() * (1000 - 100 + 1) + 100),
			elm_selector: null,
			elm_selector_string: null,
			is_down: false,
			is_up: false,
			this_slide_block_obj: null
		};
		this.this_slide_block_obj = set_slide_block_option.this_slide_block_obj;
		this.is_down = set_slide_block_option.is_down;
		this.is_up = set_slide_block_option.is_up;
		this.is_ok = set_slide_block_option.is_ok;
		this.success_show_text = style_wrapper.success_show_text;
		this.min_left = set_slide_block_option.min_left;
		this.max_left = set_slide_block_option.max_left;
		this.random = set_slide_block_option.random;
		this.elm_selector = set_slide_block_option.elm_selector;
		this.elm_selector_string = set_slide_block_option.elm_selector_string;
		this.success_url_icon = style_wrapper.success_url_icon;
		this.default_url_icon = style_wrapper.default_url_icon;
		this.success_slider_wrapper_bg = style_wrapper.success_slider_wrapper_bg;
		this.success_text_color = style_wrapper.success_text_color;
		this.init();
	}
	SlidingValidation.prototype.init = function() {
		var slider_block = this;
		this.create_slider_block();
		$(document).on('mousedown', this.elm_selector_string + ' .sliding-block', function(e) {
			var e = e || window.event || e.which;
			e.preventDefault();
			slider_block.this_slide_block_obj = $(this);
			if (slider_block.this_slide_block_obj.position().left == 0) {
				slider_block.is_up = false;
			}
			slider_block.this_slide_block_obj.css({
				"left": this.min_left + "px",
				"transition": "left 0s ease-in-out 0s"
			}); //关闭动画
			slider_block.this_slide_block_obj.siblings('.current-progress-bg').css('transition', 'width 0s ease-in-out 0s');
			slider_block.mouse_down(e, '');
		});

	}
	SlidingValidation.prototype.create_slider_block = function() {
		this.elm_selector = this.element_wrapper ? this.element_wrapper : '#sliding-block-wrapper' + this.random + '';
		this.elm_selector.indexOf('#') != -1 ? this.append_obj.append('<div onselectstart="return false;" id="' + this.elm_selector
			.split('#')[1] + '"></div>') : this.append_obj.append('<div onselectstart="return false;" class="' + this.elm_selector
			.split('.')[1] + '"></div>');
		this.elm_selector_string = this.elm_selector;
		this.elm_selector = $(this.elm_selector);
		this.elm_selector.append('<div class="sliding-block-text">请向右滑动滑块</div>');
		this.elm_selector.append('<div class="current-progress-bg"></div>');
		this.elm_selector.append(
			'<div class="sliding-block"><i style="width: 16px;height: 16px;display: inline-block;background-image: url(' +
			this.default_url_icon +
			');background-size: 100% 100%;position: absolute;top: calc(50% - 8px);left: calc(50% - 8px);"></i></div>');
		this.elm_selector.append('<div class="successful-icon"></div>');
		this.set_custom_style(this.elm_selector, this.style);
		this.set_default_style(this.elm_selector, this.style);
	};
	SlidingValidation.prototype.set_custom_style = function(wrapper, style) {
		wrapper.css({
			"width": style.slide_block_wrapper_width,
			"height": style.slide_block_wrapper_height,
			"background-color": style.slider_wrapper_bg,
			"margin": style.margin,
			"position": style.position,
			"left": style.left,
			"top": style.top,
			"z-index": style.slider_wrapper_zindex,
			"box-shadow": style.box_shadow
		});
		wrapper.find('.sliding-block').css({
			"width": style.slide_block_width,
			"height": style.slide_block_height,
			"background-color": style.slider_bg,
			"position": "absolute",
			"left": '0px',
			"top": '0px',
			"border": style.border
		});
		wrapper.find('.current-progress-bg').css({
			"width": '0px',
			"height": '100%',
			"background-color": style.progress_bg,
			"position": "absolute",
			"left": '0px',
			"top": '0px'
		});
		wrapper.find('.sliding-block-text').text(style.default_text);
		wrapper.find('.sliding-block-text').css({
			"color": style.default_text_color,
			"font-size": style.default_text_font_size
		});
	};
	SlidingValidation.prototype.set_default_style = function(wrapper, style) {
		wrapper.css({

		});
		wrapper.find('.sliding-block').css({
			"z-index": "100",
			"cursor": "pointer",
			"height": "calc(100%)"
		});
		wrapper.find('.current-progress-bg').css({
			"position": "absolute",
			"left": '0px',
			"top": '0px'
		});
		wrapper.find('.sliding-block-text').css({
			"width": "100%",
			"height": "100%",
			"text-align": "center",
			"line-height": wrapper.innerHeight() + 'px',
			"z-index": "10",
			"position": "absolute",
			"left": '0px',
			"top": '0px'
		});
	};
	SlidingValidation.prototype.mouse_down = function(e, type) {
		var down_X = e.clientX;
		var slider_block = this;
		$(document).on({
			mousemove: function(e) {
				var e = e || window.event || e.which;
				e.preventDefault();
				slider_block.mouse_move(e, down_X, '');
			},
			mouseup: function(e) {
				var e = e || window.event || e.which;
				e.preventDefault();
				slider_block.mouse_up(e, '');
			}
		}, '');
	};
	SlidingValidation.prototype.mouse_move = function(e, down_X, type) {
		if (this.is_ok) {
			this.slider_success();
			return;
		}
		if (this.is_up) {
			this.this_slide_block_obj.css({
				"left": this.min_left + "px",
				"transition": "left 0.8s ease-in-out 0s"
			});
			this.this_slide_block_obj.siblings('.current-progress-bg').css('transition', 'width 0.8s ease-in-out 0s');
			this.current_progress_bg(this.min_left);
			return;
		}
		var move_X = e.clientX;
		var current_X = move_X - down_X;
		var move_width=document.getElementById("signin-studentid").clientWidth*0.7-parseInt(this.style.slide_block_width)
		this.current_progress_bg(current_X);
		this.this_slide_block_obj.css('left', current_X + 'px');
		if (this.this_slide_block_obj.position().left < this.min_left) {
			this.this_slide_block_obj.css('left', this.min_left + 'px');
			this.current_progress_bg(this.min_left);
		}
		if (this.this_slide_block_obj.position().left >= move_width) {
			this.this_slide_block_obj.css('left', move_width + 'px');
			this.current_progress_bg(move_width);
			this.is_ok = true;
		}
	};
	SlidingValidation.prototype.mouse_up = function(e, type) {
		if (this.is_ok) { //代表到达终点
			this.is_up = false;
		} else {
			this.is_up = true;
		}
	};
	SlidingValidation.prototype.current_progress_bg = function(width) {
		this.elm_selector.find('.current-progress-bg').css("width", width + "px");
	};
	SlidingValidation.prototype.slider_success = function() {
		this.success_count += 1;
		if (this.success_count > 1) {
			return;
		}
		this.this_slide_block_obj.find('i').css('background-image', 'url(' + this.success_url_icon + ')');
		this.this_slide_block_obj.siblings('.current-progress-bg').css('background-color', this.success_slider_wrapper_bg);
		this.this_slide_block_obj.siblings('.sliding-block-text').text(this.success_show_text);
		this.this_slide_block_obj.siblings('.sliding-block-text').css('color', this.success_text_color);
		this.this_slide_block_obj.siblings('.current-progress-bg').css('transition', 'background-color 0.2s ease-in-out 0s');
		this.off_event();
		this.success();
	};
	SlidingValidation.prototype.off_event = function() {
		$(document).off("mousemove");
		$(document).off("mouseup");
	}
	SlidingValidation.prototype.isElm = function(elm) {
		if (elm.toString().indexOf('#') == -1 && elm.toString().indexOf('.') == -1) {
			return false;
		} else {
			return true;
		}
	}
	SlidingValidation.prototype.checkElm = function(elm) {
		if ($(elm).length > 0) {
			return true;
		} else {
			throw "this element does not exist.";
		}
	};
	SlidingValidation.prototype.checkFn = function(fn) {
		if (typeof fn === "function") {
			return true;
		} else {
			throw "the param is not a function.";
		}
	};
	window['SlidingValidation'] = SlidingValidation;
	SlidingValidation.create = function(append_obj, style, success) {
		return new SlidingValidation(append_obj, style, success);
	}
})(jQuery, window, document);