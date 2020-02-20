var lazyConfig = {
    scrollDirection: 'vertical',
    effect: 'fadeIn',
    visibleOnly: true,
    onError: function(element) {
        console.log('error loading ' + element.data('src'));
    }
};

$(function() {
	loadPage('1');
});

function pageNumFromUrl(url) {
	return url ? parseInt((new URL(url)).searchParams.get('page')) : null;
}

function setupPagination(current, prev, next) {
	let pagination = $('.pagination');
	pagination.empty();

	if (prev) {
		pagination.append(
			`<li class="page-item"><a class="page-link" href="${prev}" aria-label="Previous">
			 <span aria-hidden="true">«</span></a></li>`
		);
	}

	// "Скользящее окно" в 3 страницы
	for (let i = (prev || 1); i <= (next || current); i++) {
		pagination.append(
			`<li class="page-item${i === current ? ' active' : ''}"><a class="page-link" href="${i}">${i}</a></li>`
		);
	}
	
	if (next) {
		pagination.append(
			`<li class="page-item"><a class="page-link" href="${next}" aria-label="Next">
			 <span aria-hidden="true">»</span></a></li>`
		);
	}

	pagination.find('a').click(function (e) {
		e.preventDefault();
		loadPage($(e.target).closest('a').attr('href'));
	});
}

function loadPage(num) {
	let page = $('#page-content');
	let pageLoader = $('#page-loader');
	let pageLoaderImg = pageLoader.find('img');
	
	// Скрыть страницу и отобразить loader
	page.addClass('d-none');
	pageLoader.removeClass('d-none');
	pageLoaderImg.attr('src', 'img/loader.gif');
	
	// Получение и отображение данных
	$.get('https://swapi.co/api/starships/?page=' + num, function(data) {
		setupPagination(parseInt(num), pageNumFromUrl(data['previous']), pageNumFromUrl(data['next']));
		
		$('.lazy').Lazy(lazyConfig);
		
		// Скрыть loader и отобразить страницу
		pageLoader.addClass('d-none');
		page.removeClass('d-none');
	}).fail(function() {
		pageLoaderImg.attr('src', 'img/error.png');
	});
}