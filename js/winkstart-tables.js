(function(winkstart, amplify, undefined) {

	/**
	 * Type used for numeric datatables columns that are displayed as formatted text,
	 * but should still be sorted by their original numeric values.
	 * Example structure:
	 * {
	 *   display: 'text to display',
	 *   value: 1234
	 * }
	 *
	 * @typedef {Object} NumericWrapper
	 * @property {string} display The formatted text representation of the value
	 * @property {number} value The actual numeric value
	 */

	/**
	 * Ascending sort function for NumericWrapper-typed datatables columns
	 *
	 * @param {NumericWrapper} a
	 * @param {NumericWrapper} b
	 */
	$.fn.dataTableExt.oSort['numeric-wrapper-obj-asc'] = function(a, b) {
		return a.value - b.value;
	};

	/**
	 * Descending sort function for NumericWrapper-typed datatables columns
	 *
	 * @param {NumericWrapper} a
	 * @param {NumericWrapper} b
	 */
	$.fn.dataTableExt.oSort['numeric-wrapper-obj-desc'] = function(a, b) {
		return b.value - a.value;
	};

	winkstart.table = {
		create: function(name, $element, columns, data, options) {
			var THIS = this;
			var tableObj;

			if(typeof options != 'object') {
				options = {};
			}

			if(options.sDom == undefined) {
				options.sDom = '<f>t<ip>';
			}

			if(options.sPaginationType == undefined) {
				options.sPaginationType = 'full_numbers';
			}

			if(typeof data == 'object') {
				options.aaData = data;
			}

			options.aoColumns = columns;

			tableObj = $element.dataTable(options);

			tableObj.name = name;

			THIS.applyFunctions(tableObj);

			THIS.applyModifications(tableObj);

			eval('THIS.' + name + ' = tableObj;');
		},

		applyFunctions: function(table) {
			table.addData = function(data) {
				var THIS = this;

				THIS.fnAddData(data);
			};

			table.destroy = function() {
				var THIS = this;

				THIS.fnDestroy();

				eval('winkstart.table.' + THIS.name + ' = null;');
			};
		},

		applyModifications: function(table) {
			var search_wrapper = table.parents('.dataTables_wrapper').find('.dataTables_filter');
			var search = search_wrapper.find('input[type="text"]');
			var btn_search = '<input class="submit-search" type="image" src="img/search_left.png">';
			var btn_cancel = '<input class="cancel-search" type="image" src="img/search_right.png">';

			search_wrapper.contents().filter(function() {
				return this.nodeType == Node.TEXT_NODE;
			}).remove();

			// This is backwards because of the float right
			search.before(btn_cancel);
			search.after(btn_search);
		}
	};

})(	window.winkstart = window.winkstart || {}, window.amplify = window.amplify || {});
