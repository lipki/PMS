
function saveEditable(event, eventProperties) {
	$('#update').fadeIn('slow');
	id = eventProperties.editable.getId();
	content = $('#'+id).html();
	eid = $('#'+id).filter(".stop").attr('id');
	if( eid == undefined ) eid = $('#'+id).parent('.stop').attr('id');
	
	if($('#'+id).attr('nodeName') == 'H2') {
		$('a[href="#'+eid+'"] span').html(content);
		eid = 'title'+eid;
	}
	
	setTimeout( function () {saveEditableDelai(content, eid)}, 500);
}
		
function saveEditableDelai(id) {
	$.post('?s', { content:content, id:eid }, function(data) {
		//alert('Data Loaded: ' + data);
		$('#update').fadeOut('slow');
	});
}

function saveHierarchy (id, lvl) {
	$.post('?h', { id:id, lvl:lvl }, function(data) {
		//alert('Data Loaded: ' + data);
	});
}

function saveOrdre(ordre) {
	$.post('?o', { ordre:ordre }, function(data) {
		alert('Data Loaded: ' + data);
		location.reload();
	});
}

function saveNews(id) {
	content = $('#'+id+' section').html();
	title = $('#'+id+' h2').html();
	$.post('?p', { content:content, title:title }, function(data) {
		//alert('Data Loaded: ' + data);
	});
}

function deleteArticle(id) {
	$.post('?d', { id:id }, function(data) {
		//alert('Data Loaded: ' + data);
	});
}

GENTICS.Aloha.settings = {
	errorhandling	: false,
	ribbon		: false,
	'i18n'		: {'current': 'fr'},
	'plugins'	: {
				'com.gentics.aloha.plugins.Link': {
					targetregex : '^(?!.*aloha-editor.com).*',
					target : '_blank',
					cssclassregex : '^(?!.*aloha-editor.com).*',
					cssclass : 'external' }, 
				'com.gentics.aloha.plugins.Table': {
					config: ['table'] },
				'com.gentics.aloha.plugins.Format': { 
					config : [ 'b', 'i','u','del','sub','sup', 'p', 'title', 'h3', 'h4', 'h5', 'h6', 'pre', 'removeFormat'],
				} 
			  }
};

$(document).ready(function() {
	
	// editable
	$('h1').aloha();
	$('article h2').aloha();
	$('article section').aloha();
	$('footer').aloha();
	
	// sortable
	$( '#accordion' ).sortable({ update: function(event, ui) {
		ordre = [];
		$('nav li a').each(function(){
			nb = $(this).attr('href').split('#article').join('');
			ordre.push(nb);
		});
		saveOrdre(ordre);
	}}).disableSelection();
	
	//hiearachisable
	$('nav li').not('li.lvl4').prepend('<span class="hdown">></span> ');
	$('nav li').not('li.lvl0').prepend('<span class="hup"><</span> ');
	
	$('.hup').live('click', function () {
		li = $(this).parent('li');
		lvl = Number( li.attr('class').split('lvl').join('') ) - 1;
		li.removeClass().addClass('lvl'+lvl);
		
		if( lvl == 0 ) li.find('.hup').remove();
		else if( lvl == 3 ) li.prepend('<span class="hdown">></span> ');
		
		id = li.find('a').attr('href').split('#').join('');
		
		saveHierarchy(id, lvl);
	});
	
	$('.hdown').live('click', function () {
		li = $(this).parent('li');
		lvl = Number( li.attr('class').split('lvl').join('') ) + 1;
		li.removeClass().addClass('lvl'+lvl);
		
		if( lvl == 1 ) li.prepend('<span class="hup"><</span> ');
		else if( lvl == 4 ) li.find('.hdown').remove();
		
		id = li.find('a').attr('href').split('#').join('');
		
		saveHierarchy(id, lvl);
	});
	
	//plusable
	$('nav').append('<span class="plus">+</span>');
	
	$('.plus').click(function () {
		nb = $('nav li').length+1;
		
		$('.top:last').after('<article id="article'+nb+'" class="stop"><h2>Vide</h2><section>Vide.</section></article><a class="top" href="#accordion"><span>menu</span></a>');
		$('#accordion').append('<li><a href="#article'+nb+'"><span>Vide</span></a></li>');
		
		saveNews('article'+nb);
		
		$('#article'+nb+' h2').aloha();
		$('#article'+nb+' section').aloha();
	});
	
	//moinsable
	$('nav li').append(' <span class="moins">-</span>');
	
	$('.moins').click(function () {
		href = $(this).parent('li').find('a').attr('href');
		id = href.split('#').join('');
		
		$(this).parent('li').remove();
		$(href).remove();
		
		deleteArticle(id);
	});
	
});

GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, 'editableDeactivated', saveEditable);