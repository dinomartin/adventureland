// Simple Item Destruction Helper
// Copy-paste this entire code into browser console (F12)

(function() {
	console.log("=== Item Destruction Helper Loaded ===");

	// Function to destroy item by slot number
	window.destroy_item = function(slot, quantity) {
		if (!window.character) {
			console.log("❌ Error: Character not loaded");
			return;
		}

		var item = character.items[slot];
		if (!item) {
			console.log("❌ Error: No item in slot " + slot);
			return;
		}

		// Check if locked
		if (item.l) {
			console.log("❌ Cannot destroy: Item is LOCKED");
			return;
		}

		// Check if blocked
		if (item.b) {
			console.log("❌ Cannot destroy: Item is BLOCKED");
			return;
		}

		// Default quantity
		if (!quantity) {
			quantity = item.q || 1;
		}

		// Show item info
		var item_desc = item.name;
		if (item.level) item_desc += " +" + item.level;
		if (quantity > 1) item_desc += " (x" + quantity + ")";

		console.log("🗑️ Destroying: " + item_desc + " from slot " + slot);

		// Send destroy command
		socket.emit("destroy", {num: slot, q: quantity});

		return "Item destroyed: " + item_desc;
	};

	// Function to list all items in inventory
	window.list_inventory = function() {
		if (!window.character) {
			console.log("❌ Error: Character not loaded");
			return;
		}

		console.log("=== INVENTORY ===");
		for (var i = 0; i < character.items.length; i++) {
			var item = character.items[i];
			if (item) {
				var desc = "Slot " + i + ": " + item.name;
				if (item.level) desc += " +" + item.level;
				if (item.q && item.q > 1) desc += " (x" + item.q + ")";
				if (item.l) desc += " [LOCKED]";
				if (item.b) desc += " [BLOCKED]";
				console.log(desc);
			}
		}
		console.log("================");
		return "Total items: " + character.items.filter(function(x){return x;}).length;
	};

	// Function to destroy item by name (first match)
	window.destroy_item_by_name = function(item_name, quantity) {
		if (!window.character) {
			console.log("❌ Error: Character not loaded");
			return;
		}

		// Find item by name
		for (var i = 0; i < character.items.length; i++) {
			var item = character.items[i];
			if (item && item.name === item_name) {
				return destroy_item(i, quantity);
			}
		}

		console.log("❌ Error: Item '" + item_name + "' not found in inventory");
		return null;
	};

	// Show help
	console.log("");
	console.log("📝 Available Functions:");
	console.log("  list_inventory()              - Show all items");
	console.log("  destroy_item(slot)            - Destroy item in slot");
	console.log("  destroy_item(slot, quantity)  - Destroy X quantity");
	console.log("  destroy_item_by_name('name')  - Destroy by item name");
	console.log("");
	console.log("📖 Examples:");
	console.log("  list_inventory()               // See what you have");
	console.log("  destroy_item(5)                // Destroy slot 5");
	console.log("  destroy_item(3, 10)            // Destroy 10 from slot 3");
	console.log("  destroy_item_by_name('hpot1')  // Destroy hpot1");
	console.log("");
	console.log("✅ Helper loaded! Try: list_inventory()");
})();
