function init() {

    var startStokeX;
    var startStokeY;

    bindActions();

    function startDragInitial(event, ui) {
        const draggedEl = ui.helper[0];
        $(draggedEl).addClass('draggable-border');
    }

    function stopDragInitial(event, ui) {
        let draggedEl = ui.helper[0];
        draggedEl = $(draggedEl);
        draggedEl.removeClass('draggable-border');
        const itemType = draggedEl.attr('data-item-type');
        const itemText = draggedEl.attr('data-item-text');
        const el = $("<div></div>").addClass('pos-abs draggable cursor-pointer' + (itemType === 'diamond' ? ' action-decision' : '')).css({ top: ui.offset.top, left: ui.offset.left });
        const elAction = $("<div></div>").addClass(itemType);
        if (itemType === 'diamond') {
            elAction.html('<span class="pos-abs decision">' + itemText + '</span>');
        } else {
            elAction.text(itemText)
        }
        const elDotTop = $("<div class='dot top'></div>");
        const elDotBottom = $("<div class='dot bottom'></div>");
        el.append(elDotTop).append(elAction).append(elDotBottom);
        $('#droppable').append(el);
        $(el).draggable({
            delstartY: 100
        });
        $(elDotBottom).draggable({
            delstartY: 100,
            start: startStroke,
            drag: continueStroke
        });
        $(elDotTop).droppable({
            drop: endStroke
        });
        $(elAction).on('click', nodeSelected);
    }

    function nodeSelected() {
        const el = $(this);
        $('.node-selected').removeClass('node-selected');
        el.addClass('node-selected')
        $('#label').val(el.text());
    }

    function updateLabel() {
        const el = $(this);
        const selectedNode = $('.node-selected');
        if (selectedNode.has('.decision').length) {
            selectedNode.find('.decision').text(el.val());
        } else {
            selectedNode.text(el.val());
        }
    }

    function startStroke(event, ui) {
        startStokeX = ui.offset.left;
        startStokeY = ui.offset.top;
    }

    function continueStroke(event, ui) {
        const endStokeX = ui.offset.left;
        const endStokeY = ui.offset.top;
        linedraw(startStokeX, startStokeY, endStokeX, endStokeY);
    }

    function endStroke(event, ui) {
        const endStokeX = ui.offset.left;
        const endStokeY = ui.offset.top;
        linedraw(startStokeX, startStokeY, endStokeX, endStokeY);
    }

    function linedraw(startX, startY, endX, endY) {
        const id = 'line_' + startX + '_' + startY;
        const line = document.getElementById(id);
        line && line.remove();
        if (startY > endY) {
            endX = startX + endX;
            startX = endX - startX;
            endX = endX - startX;
            endY = startY + endY;
            startY = endY - startY;
            endY = endY - startY;
        }
        let calc = Math.atan((startY - endY) / (endX - startX));
        calc = calc * 180 / Math.PI;
        const length = Math.sqrt((startX - endX) * (startX - endX) + (startY - endY) * (startY - endY));
        document.body.innerHTML += "<div id='" + id + "' style='height:" + length + "px;width:1px;background-color:black;position:absolute;top:" + (startY) + "px;left:" + (startX) + "px;transform:rotate(" + calc + "deg);-ms-transform:rotate(" + calc + "deg);transform-origin:0% 0%;-moz-transform:rotate(" + calc + "deg);-moz-transform-origin:0% 0%;-webkit-transform:rotate(" + calc + "deg);-webkit-transform-origin:0% 0%;-o-transform:rotate(" + calc + "deg);-o-transform-origin:0% 0%;'></div>"
    }

    function bindActions() {
        $('.draggable-dummy').draggable({
            delstartY: 300,
            distance: 100,
            revert: true,
            revertDuration: 0,
            start: startDragInitial,
            stop: stopDragInitial,
        });

        $('#droppable').droppable({
            drop: function (event, ui) {
            }
        })

        $('#label').on('blur', updateLabel);
    }

}