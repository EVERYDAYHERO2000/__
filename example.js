var collection = __.collection.__;


__.colllection.add('menu__link', {
	class: 'menu__link',
	tag: 'a',
	content: '',
	attrs: {
		href: ''
	}
});


__.collection.add('menu', { 
	tag: 'div', // .menu
	class: 'menu',
	content: [colllection.menu__link],
	state: {
		create: function (e) {
			//do when create()
		},
		destroy: function (e) {
			//do when destroy()	
		},
		dataupdate: function (e) {
			//do when data set
		}
	},
	events: {
		click: function (e, this) {}, //params : event, target
		scroll: function (e, document.body) {}
	},
	css: {
		normal: {
			background: 'red',
			color: 'blue'
		},
		hover: {
			background: 'black'
		},
		active: {

		}
	},
	attrs: {
		title: 'title'
	},
	data: {
		key: value
	}
});



__.build({
	document: colllection.document.content({
		
		menu: colllection.menu_link.data(data, function (e)({
			
			menu_link: colllection.menu__link.mix({
				content : e.title,
				attrs: {
					href: e.url
				}
			});
			
		}) ),
		
		page: colllection.page.content({
			
			content: colllection.content,
			
			colomn: colllection.colomn
		}),
		
		futer: collection.futer
	})
});

[
	elem, [
		elem, 
			elem, 
			[
				elem, 
				elem
			]
		]
]