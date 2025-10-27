// Drag and Drop Item Destroyer - Simple Version
// Copy-paste this code into browser console (F12)

(function() {
    console.log("🎯 Initializing Drag-Drop Item Destroyer...");

    // Global state
    var isDragging = false;
    var draggedSlot = null;
    var dropZone = null;

    // Create visual drop zone
    function createDropZone() {
        if (document.getElementById('item-drop-zone')) return;

        var zone = document.createElement('div');
        zone.id = 'item-drop-zone';
        zone.innerHTML = '<div class="drop-text">🗑️ Drop Here to Destroy</div>';

        // Styling
        zone.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 200px;
            height: 100px;
            background: rgba(255, 0, 0, 0.1);
            border: 3px dashed #ff0000;
            border-radius: 10px;
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            transition: all 0.3s ease;
            pointer-events: all;
        `;

        zone.querySelector('.drop-text').style.cssText = `
            color: #ff0000;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            pointer-events: none;
        `;

        document.body.appendChild(zone);
        dropZone = zone;

        // Drop zone hover effect
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            zone.style.background = 'rgba(255, 0, 0, 0.3)';
            zone.style.transform = 'scale(1.05)';
        });

        zone.addEventListener('dragleave', function(e) {
            zone.style.background = 'rgba(255, 0, 0, 0.1)';
            zone.style.transform = 'scale(1)';
        });

        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            zone.style.background = 'rgba(255, 0, 0, 0.1)';
            zone.style.transform = 'scale(1)';
            handleDrop();
        });

        console.log("✅ Drop zone created");
    }

    // Setup drag listeners on inventory items
    function setupDragListeners() {
        // Find all item containers
        var items = document.querySelectorAll('[id^="citem"], .gamebutton, .clickable');

        items.forEach(function(element) {
            // Check if this element represents an inventory item
            var id = element.id;
            if (!id || !id.match(/citem\d+/)) return;

            // Extract slot number
            var slotMatch = id.match(/citem(\d+)/);
            if (!slotMatch) return;

            var slot = parseInt(slotMatch[1]);

            // Skip if already setup
            if (element.dataset.dragSetup) return;
            element.dataset.dragSetup = 'true';

            // Make element draggable
            element.draggable = true;
            element.style.cursor = 'grab';

            // Drag start
            element.addEventListener('dragstart', function(e) {
                if (!window.character || !window.character.items[slot]) return;

                var item = window.character.items[slot];

                // Don't drag locked/blocked items
                if (item.l || item.b) {
                    e.preventDefault();
                    console.log("❌ Cannot drag locked/blocked item");
                    return;
                }

                isDragging = true;
                draggedSlot = slot;
                element.style.opacity = '0.5';
                element.style.cursor = 'grabbing';

                // Show drop zone
                if (dropZone) {
                    dropZone.style.display = 'flex';
                }

                console.log("📦 Dragging item from slot " + slot + ": " + item.name);
            });

            // Drag end
            element.addEventListener('dragend', function(e) {
                element.style.opacity = '';
                element.style.cursor = 'grab';

                // Hide drop zone
                if (dropZone) {
                    dropZone.style.display = 'none';
                }

                isDragging = false;
                draggedSlot = null;
            });
        });
    }

    // Handle drop
    function handleDrop() {
        if (draggedSlot === null) return;

        var slot = draggedSlot;
        var item = window.character.items[slot];

        if (!item) {
            console.log("❌ No item in slot " + slot);
            return;
        }

        // Build item description
        var desc = item.name;
        if (item.level) desc += " +" + item.level;
        if (item.q && item.q > 1) desc += " (x" + item.q + ")";

        // Confirm destruction
        if (confirm("Destroy item: " + desc + "?\n\nThis action cannot be undone!")) {
            console.log("🗑️ Destroying: " + desc + " from slot " + slot);

            // Use the destroy function (same as console helper)
            socket.emit("destroy", {num: slot, q: item.q || 1});

            console.log("✅ Item destroyed!");
        } else {
            console.log("❌ Destruction cancelled");
        }
    }

    // Initialize
    function init() {
        createDropZone();
        setupDragListeners();

        // Re-setup every 2 seconds (for dynamic inventory updates)
        setInterval(setupDragListeners, 2000);

        console.log("");
        console.log("✅ Drag-Drop Item Destroyer READY!");
        console.log("");
        console.log("📖 How to use:");
        console.log("  1. Click and hold any item in inventory");
        console.log("  2. Drag the item");
        console.log("  3. Drop zone will appear (bottom right)");
        console.log("  4. Drop item on the red zone");
        console.log("  5. Confirm destruction");
        console.log("");
        console.log("🛡️ Safety: Locked/blocked items cannot be dragged");
        console.log("");
    }

    // Start after a short delay
    setTimeout(init, 1000);

})();
