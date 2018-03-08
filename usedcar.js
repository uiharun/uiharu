// used car
var usedcar = {
	initSearchConditions: function() {
		$(".usedcarIndexContainer2 li").on("click", function() {
			var name = change_name( $(this).closest("dl").attr("class") );

			if ($(this).hasClass("selected")) {
				$(this).removeClass("selected");
				$("input[name='" + name + "']").val("");
			} else {
				$(this).siblings().removeClass("selected");
				$(this).addClass("selected");

				$("input[name='" + name + "']").val($(this).data("code"));
			}
		});

		$(".btnClear").on("click", function() {
			$(".usedcarIndexContainer2 li").removeClass("selected");
			$(".usedcarIndexContainer2 input[type='hidden']").val("");
		});
	},


	initTables: function() {
		$(".car table").each(function() {
			var $td = $(this).find("td");
			var html = '<table class="sp"><tr><th>年式</th><td>'
				+ $td.eq(0).html()
				+ '</td><th>ハンドル</th><td>'
				+ $td.eq(4).html()
				+ '</td></tr><tr><th>走行距離</th><td>'
				+ $td.eq(3).html()
				+ '</td><th>カラー</th><td>'
				+ $td.eq(7).html()
				+ '</td></tr><tr><th>排気量</th><td>'
				+ $td.eq(6).html()
				+ '</td><th>内装</th><td>'
				+ $td.eq(2).html()
				+ '</td></tr><tr><th>車検</th><td>'
				+ $td.eq(1).html()
				+ '</td><th>在庫店舗</th><td>'
				+ $td.eq(5).html()
				+ '</td></tr></table>';

			$(this).addClass("pc").after(html);
		});
	},

	initImages: function() {

		var $li = $(".usedcarDetailContainer .img li");
		var $img = $(".usedcarDetailContainer .img .main img");

		$li.on("click", function() {

			if ($(this).hasClass("current")) return;

			var src = $(this).children().attr("src");
			$img.css({ opacity: 0 }).on("transitionend", function() {
				$(this).attr({ src: src }).css({ opacity: 1 });
			});

			$li.removeClass("current");
			$(this).addClass("current");
		});
	},

	formDiv    : $(".form .box"),
	formCeiling: 0,
	formFloor  : 0,
	formLeft   : 0,
	formStatus : "",

	initFormColumn: function() {

		if ($(".globalNav").css("display") == "none") {

			$(window).off("scroll.usedcar");

			$(".form").css({ height: "auto" });
			this.formDiv.removeClass("fixed bottom").css({ left: 0, width: "auto" });
			this.formStatus = "";

		} else {

			$(".form").css({ height: $(".body").outerHeight() });

			this.formCeiling = $(".usedcarDetailContainer").offset().top;
			this.formFloor = $(".footer").offset().top - $(".box").outerHeight();
			this.formLeft = $(".form").offset().left;

			this.formDiv.css({ width: $(".form").width() });

			if (this.formStatus == "") {
				$(window).on("scroll.usedcar", this.fixFormColumn);
				this.fixFormColumn();
			} else if (this.formStatus == "fixed") {
				this.formDiv.css({ left: usedcar.formLeft });
			}
		}
	},

	fixFormColumn: function() {

		var _this = usedcar;

		if (_this.modalOpen) return;

		var scrollTop = $(window).scrollTop();

		if (scrollTop < _this.formCeiling && _this.formStatus != "top") {
			_this.formDiv.removeClass("fixed bottom").css({ left: 0 });
			_this.formStatus = "top";
		} else if (scrollTop > _this.formFloor && _this.formStatus != "bottom") {
			_this.formDiv.removeClass("fixed").addClass("bottom").css({ left: 0 });
			_this.formStatus = "bottom";
		} else if (scrollTop >= _this.formCeiling && scrollTop <= _this.formFloor && _this.formStatus != "fixed") {
			_this.formDiv.removeClass("bottom").addClass("fixed").css({ left: _this.formLeft });
			_this.formStatus = "fixed";
		}
	},

	modalOpen: false,

	showFormModalWindow: function() {

		this.modalOpen = true;
		var _this = this;

		var scrollPos = $(window).scrollTop();

		var content = '<div id="modalContainer"><div id="modalContents"><div id="modalForm"><p>送信完了しました。<br>お問い合わせありがとうございました。</p><div id="modalCloseBtn"><a href="#">閉じる</a></div><a href="#" id="modalClose">Close</a></div></div></div>';

		$("#overflowContainer").css({ position: "fixed", top: -scrollPos });
		$("body").append('<div id="modalCover"></div>', content);
		$("#modalCover").fadeIn(300, function() {
			$("#modalContainer").fadeIn(200).css({ display: "table" });
			$(window).scrollTop(0);
		});

		$("#modalContainer").children().children().on("click", function(e) {
			e.stopPropagation();
		});

		$("#modalContainer, #modalClose, #modalCloseBtn a").one("click", function() {

			$("#modalContainer").hide().remove();
			$("#modalCover").fadeOut(600, function() {
				$(this).remove();
			});

			setTimeout(function() {

				$("#overflowContainer").css({ position: "static", top: 0 });
				$(window).scrollTop(scrollPos);

				_this.modalOpen = false;

			}, 100);

			$(".form input, .form textarea").removeClass("error").val("");
			$(".form form p").remove();

			return false;
		});
	},

	page       : 1,
	page_count : 3,
	sort       : 0
};

// on load
$(function() {

	// init
	var windowWidth = $(window).width();
	var resizeTimer;

	// used car
	if ($(".usedcarIndexContainer1")[0]) {
		usedcar.initTables();
		usedcar.initSearchConditions();
	}  else if ($(".usedcarDetailContainer")[0]) {
		usedcar.initImages();
		usedcar.initFormColumn();
	}

	// on resize
	$(window).on("resize.usedcar", function() {

		if (resizeTimer !== false) {
			clearTimeout(resizeTimer);
		}

		resizeTimer = setTimeout(function() {
			var w = $(window).width();
			if (w != windowWidth) {

				windowWidth = w;
				if ($(".usedcarDetailContainer")[0]) {
					usedcar.initFormColumn();
				}
			}
		}, 100);
	});

	$("div.sort a").on("click", function(){
		if( !$(this).hasClass("selected") ){
			$("div.sort a").removeClass("selected");
			$(this).addClass("selected");
		}
		usedcar.sort = $("div.sort a").index(this);
	});

	$(".btnSearch").on("click", function(){


    var sort  = ["regist", "-regist", "price", "-price", "year", "-year", "mileage", "-mileage"];
    var param = clean_query( $('div.buttons input').serialize() )
              + "&page="       + usedcar.page
              + "&page_count=" + usedcar.page_count
              + "&sort="       + sort[ usedcar.sort ];

		$.ajax({
			url      : "http://www.bubu.co.jp/api/v1/cars/",
			type     : "post",
			data     : param,
			dataType : "JSON",
			cache    : false,
			}).fail( function( XMLHttpRequest, textStatus, errorThrown ){
				alert("ng");
			}).done( function( data ){
				console.log(data);
				alert("ok");
		  });
	});

});

// 空のパラメータを除去
function clean_query( query )
{
  var arr = [];
  $.each( query.split('&'), function( i, param ){
    if( param.split('=')[1] ){
      arr.push(param);
    }
  });
  return arr.join('&');
}

// クラス名をパラメータ名に変換
function change_name( val ){
	var input_name = {
    "model"  : "model",
    "style"  : "body_type",
    "price"  : "price",
    "year"   : "model_year",
    "mileage": "mileage",
    "color"  : "body_color"
 	};
	return input_name[val];
}