// Drag-and-Drop Item Destruction Feature
// This code enables dragging items out of inventory to destroy them

(function() {
	// Configuration
	var DRAG_DROP_ENABLED = true;
	var REQUIRE_CONFIRMATION = true;
	var DROP_ZONE_MARGIN = 50; // pixels outside inventory to activate drop

	// State tracking
	var dragging_item_num = null;
	var dragging_item_name = null;
	var drag_started_in_inventory = false;

	// Get inventory container element
	function get_inventory_container() {
		return document.getElementById("inventory") || document.querySelector(".inventory");
	}

	// Check if coordinates are outside inventory
	function is_outside_inventory(x, y) {
		var inv = get_inventory_container();
		if (!inv) return false;

		var rect = inv.getBoundingClientRect();
		return (
			x < rect.left - DROP_ZONE_MARGIN ||
			x > rect.right + DROP_ZONE_MARGIN ||
			y < rect.top - DROP_ZONE_MARGIN ||
			y > rect.bottom + DROP_ZONE_MARGIN
		);
	}

	// Setup drag event listeners on inventory items
	function setup_drag_listeners() {
		if (!DRAG_DROP_ENABLED) return;

		// Find all inventory item elements
		var items = document.querySelectorAll('.inventory-item, [id^="citem"]');

		items.forEach(function(item_el) {
			// Skip if already has listener
			if (item_el.dataset.dragDropSetup) return;
			item_el.dataset.dragDropSetup = "true";

			// Make draggable
			item_el.setAttribute('draggable', 'true');

			// Dragstart - track what's being dragged
			item_el.addEventListener('dragstart', function(e) {
				// Extract item number from element
				var id = item_el.id || '';
				var match = id.match(/citem(\d+)/);

				if (match && character && character.items) {
					var num = parseInt(match[1]);
					var item = character.items[num];

					if (item && item.name) {
						dragging_item_num = num;
						dragging_item_name = item.name;
						drag_started_in_inventory = true;

						// Visual feedback
						item_el.style.opacity = '0.5';

						// Set drag data
						e.dataTransfer.effectAllowed = 'move';
						e.dataTransfer.setData('text/plain', 'item:' + num);
					}
				}
			});

			// Dragend - cleanup
			item_el.addEventListener('dragend', function(e) {
				item_el.style.opacity = '';

				// Check if dropped outside inventory
				if (drag_started_in_inventory && dragging_item_num !== null) {
					var x = e.clientX;
					var y = e.clientY;

					if (is_outside_inventory(x, y)) {
						handle_item_drop_outside(dragging_item_num, dragging_item_name);
					}
				}

				// Reset state
				dragging_item_num = null;
				dragging_item_name = null;
				drag_started_in_inventory = false;
			});
		});
	}

	// Handle item dropped outside inventory
	function handle_item_drop_outside(item_num, item_name) {
		if (!character || !character.items || !character.items[item_num]) {
			return;
		}

		var item = character.items[item_num];
		var item_def = G.items[item_name];

		// Check if item is locked or blocked
		if (item.l) {
			game_log("Cannot destroy: Item is locked", "red");
			return;
		}
		if (item.b) {
			game_log("Cannot destroy: Item is blocked", "red");
			return;
		}

		// Confirmation dialog
		if (REQUIRE_CONFIRMATION) {
			var item_description = item_name;
			if (item.level) item_description += " +" + item.level;
			if (item.q && item.q > 1) item_description += " (x" + item.q + ")";

			var confirmed = confirm("Destroy item: " + item_description + "?\n\nThis action cannot be undone!");

			if (!confirmed) {
				game_log("Item destruction cancelled", "gray");
				return;
			}
		}

		// Send destroy command to server
		socket.emit("destroy", {num: item_num, q: item.q || 1});
		game_log("Item destroyed: " + item_name, "orange");
	}

	// Initialize on page load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function() {
			setTimeout(setup_drag_listeners, 1000);
		});
	} else {
		setTimeout(setup_drag_listeners, 1000);
	}

	// Re-setup when inventory updates
	var original_render_inventory = window.render_inventory;
	if (typeof original_render_inventory === 'function') {
		window.render_inventory = function() {
			var result = original_render_inventory.apply(this, arguments);
			setTimeout(setup_drag_listeners, 100);
			return result;
		};
	}

	// Also setup periodically (in case inventory gets re-rendered)
	setInterval(setup_drag_listeners, 3000);

	console.log("Drag-and-drop item destruction enabled!");
	console.log("  - Drag items outside inventory to destroy them");
	console.log("  - Confirmation dialog will appear before destruction");

})();
