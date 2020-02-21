$(function() {
	// Навигация пультом
	$(document).keydown(function(e) {
		switch (e.keyCode) {
			case 38: // UP
				$('.list-group-item-action.active').prev().click();
				break;
			case 40: // DOWN
				$('.list-group-item-action.active').next().click();
				break;
			case 37: // LEFT
				$('.page-prev').click();
				break;
			case 39: // RIGHT
				$('.page-next').click();
				break;
			case 10009: // RETURN
				tizen.application.getCurrentApplication().exit();
				break;
			default:
				break;
		}
	});
	loadPage('1');
});

function pageNumFromUrl(url) {
	return url ? parseInt((new URL(url)).searchParams.get('page')) : null;
}

function idFromUrl(url) {
	let a = url.split('/');
	return a[a.length - 2];
}

function setupPagination(current, prev, next) {
	let $pagination = $('.pagination');
	$pagination.empty();

	if (prev) {
		$pagination.append(
			`<li class="page-item"><a class="page-link page-prev" href="${prev}" aria-label="Previous">
			 <span aria-hidden="true">«</span></a></li>`
		);
	}

	// "Скользящее окно" в 3 страницы
	for (let i = (prev || 1); i <= (next || current); i++) {
		$pagination.append(
			`<li class="page-item${i === current ? ' active' : ''}"><a class="page-link" href="${i}">${i}</a></li>`
		);
	}
	
	if (next) {
		$pagination.append(
			`<li class="page-item"><a class="page-link page-next" href="${next}" aria-label="Next">
			 <span aria-hidden="true">»</span></a></li>`
		);
	}

	$pagination.find('a').click(function (e) {
		e.preventDefault();
		loadPage($(e.target).closest('a').attr('href'));
	});
}

function loadPage(num) {
	let $page = $('#page-content');
	let $pageLoader = $('#page-loader');
	let $pageLoaderImg = $pageLoader.find('img');

	// Скрыть страницу и отобразить loader
	$page.addClass('d-none');
	$pageLoader.removeClass('d-none');
	$pageLoaderImg.attr('src', 'img/loader.gif');
	
	// Получение и отображение данных
	$.get('https://swapi.co/api/starships/?page=' + num, function(data) {
		let $shipList = $('#ship-list');
		let $tabContent = $('.tab-content');
		let $tabPaneSample = $('.tab-pane.d-none').clone();
		let first = true;

		$tabContent.empty();
		$shipList.empty();
		data['results'].forEach(function (elem) {
			let id = idFromUrl(elem['url']);
			let $tabPane = $tabPaneSample.clone().removeClass('d-none').attr('id', 'ship-' + id);

			// Картинка
			function loadTabPaneImage() {
				$tabPane.find('.lazy')
					.on( "error", function () {
						let $self = $(this);
						$self.attr('src', 'img/error.png');
						$self.attr('alt', 'Error');
					})
					.removeClass('lazy')
					.attr('src', `https://starwars-visualguide.com/assets/img/starships/${id}.jpg`);
			}

			// Описание
			let text = '';
			$.each(elem, function (k, v) {
				if (typeof v === 'string') {
					text += `${k}: ${v}<br />`;
				}
			});
			$tabPane.find('.card-title').text(elem['name']);
			$tabPane.find('.card-text').html(text);
			$tabContent.append($tabPane);

			// Добавление в список
			let $listItem = $(`<a class="list-group-item list-group-item-action${first ? ' active' : ''}" 
								 data-toggle="list" href="#ship-${id}" role="tab">${elem['name']}</a>`);
			$shipList.append($listItem);
			if (first) {
				$tabPane.addClass('active show');
				loadTabPaneImage();
				first = false;
			} else {
				// Настройка lazy loading
				$listItem.on('shown.bs.tab', loadTabPaneImage);
			}
		});
		$tabContent.append($tabPaneSample);
		
		setupPagination(parseInt(num), pageNumFromUrl(data['previous']), pageNumFromUrl(data['next']));

		// Скрыть loader и отобразить страницу
		$pageLoader.addClass('d-none');
		$page.removeClass('d-none');
	}).fail(function() {
		$pageLoaderImg.attr('src', 'img/error.png');
		$pageLoaderImg.attr('alt', 'Error');
	});
}