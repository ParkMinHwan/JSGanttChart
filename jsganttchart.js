(function ($, _, Backbone) {
	'use strict';

	var root = window,

		jsgtThis = window,

		JSGanttChart = root.JSGanttChart = function () {
			jsgtThis = this;
		},

		elements,

		types = {},

		fieldNames = {
			id: 'ID',
			name: 'Item name',
			estimatedHours: 'Estim. Hours'
		},

		mandatoryFields = ['id', 'name', 'startDate'],

		GanttChartView = Backbone.View.extend({
			elements: undefined,

			fieldOrder: ['id', 'name'],

			setElements: function (elements) {
				this.elements = this.normalise(_(elements).clone());
			},

			normalise: function (elements) {
				_(elements).each(function (element) {
					_(mandatoryFields).each(function (field) {
						if (!element.hasOwnProperty(field)) {
							throw "element is missing " + field + " " + element;
						}
					});

					if (!_(element.startDate).isDate()) {
						element.startDate = new Date(element.startDate);
					}

					if (element.hasOwnProperty("endDate") && !_(element.endDate).isDate()) {
						element.endDate = new Date(element.endDate);
					}

					if (!element.hasOwnProperty("endDate")) {
						element.endDate = new Date(element.startDate.getTime());
						if (element.hasOwnProperty("duration")) {
							element.endDate.setDate(element.startDate.getDate() + element.duration);
						} else {
							element.endDate.setDate(element.startDate.getDate() + 1);
						}
						delete element.duration;
					}
				});
				return elements;
			},

			render: function () {
				var this_ = this,
					firstDate,
					lastDate,
					dateIterator,,
					row,
					cell,
					jel;

				$(this.el).html('');

				return this.renderDataTable().renderGanttChart().renderKey();
			},

			renderDataTable: function () {
				var table = jQuery('<table cellspacing="0"></table>'),
					row;
				// Populate headers
				row = jQuery('<tr></tr>');
				_(this_.fieldOrder).each(function (field) { row.append('<th>' + fieldNames[field] + '</th>'); });
				table.append(row);

				// Populate data
				_(elements).each(function (element) {
					row = jQuery('<tr></tr>');
					_(this_.fieldOrder).each(function (field) { row.append('<td>' + (element.hasOwnProperty(field) ? element[field] : '') + '</td>'); });
					row.click(function (e) { jsgtThis.trigger("row_click", e, element); return false; });
					table.append(row);
				});

				$(this.el).append(table);
			},

			renderGanttChart: function () {
				_(elements).each(function (element) {
					var startDate = element.startDate.getTime(),
						endDate = element.endDate.getTime();
					firstDate = (!firstDate || startDate < firstDate) ? startDate : firstDate;
					lastDate = (!lastDate || endDate > lastDate) ? endDate : lastDate;
				});
				firstDate = new Date(firstDate);
				lastDate = new Date(lastDate);

				container = jQuery('<div class="gantt"></div>');
				row = jQuery('<div class="dates"></div>');

				dateIterator = new Date(firstDate.getTime());
				while (dateIterator <= lastDate) {
					row.append('<div class="cell">' + dateIterator.getDate() + '</div>');
					dateIterator.setDate(dateIterator.getDate() + 1);
				}
				container.append(row);

				_(elements).each(function (element) {
					row = jQuery('<div class="row"></div>');
					row.click(function (e) { jsgtThis.trigger("row_click", e, element); })

					dateIterator = new Date(firstDate.getTime());
					while (dateIterator <= lastDate) {
						cell = jQuery('<div class="cell"></div>');

						if (element.startDate.getDate() == dateIterator.getDate() && 
								element.startDate.getMonth() == dateIterator.getMonth() &&
								element.startDate.getFullYear() == dateIterator.getFullYear()) {
							var noOfDays = Math.round((element.endDate.getTime() - element.startDate.getTime()) / (24 * 60 * 60 * 1000));
							gel = jQuery('<div class="el"></div>').
								css({ width: noOfDays * 25 });
							if (element.type) {
								gel.css({ background: types[element.type.color] });
							}
							cell.append(gel);
						}
						row.append(cell);
						dateIterator.setDate(dateIterator.getDate() + 1);
					}
					container.append(row);
				});

				$(this.el).append(container); // make it a adjustable table view
			},

			renderKey: function () {
				
			}
		}),
		gc;

	_(JSGanttChart).extend({
		create: function () {
			var F = function () {}, // Dummy function
	            o;
	        F.prototype = JSGanttChart.prototype;
	        o = new F();
	        JSGanttChart.apply(o, arguments);
	        o.constructor = JSGanttChart;
	        return o;
		}
	});

	_(JSGanttChart.prototype).extend(Backbone.Events, {
		setElements: function (newelements) {
			elements = newelements;
		},

		setTypes: function (newtypes) {
			types = newtypes;
		},

		setElement: function (element) {
			_(elements).each(function (el) {
				if (el.id === element.id) {
					_(el).extend(el); // Ewww... hacky
				}
			});
			console.log("Render?")
			gc.render();
		},

		getDOM: function () {
			gc = new GanttChartView();
			gc.setElements(elements);
			var el = gc.render().el;
			return el;
		}
	});

}(jQuery, _, Backbone));