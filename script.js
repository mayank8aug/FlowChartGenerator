function init() {

    let startStrokeX;
    let startStrokeY;
    let i = 0;
    let data = localStorage.getItem('flowChartData');
    data = data && JSON.parse(data) || [];

    bindActions();
    initRender();

    // Rendering initial data from storage
    function initRender() {
        let dataItem;
        for (i = 0, len = data.length; i < len; i++) {
            dataItem = data[i];
            if (dataItem.type === 'connector') {
                linedraw(dataItem.startX, dataItem.startY, dataItem.endX, dataItem.endY);
            } else {
                createNode(dataItem.type, dataItem.text, dataItem.top, dataItem.left, i);    
            } 
        }
    }

    // Dragging element from left sidebar towards the main canvas
    function startDragInitial(event, ui) {
        const draggedEl = ui.helper[0];
        $(draggedEl).addClass('draggable-border');
    }

    // Drop element from left sidebar to the main canvas
    function stopDragInitial(event, ui) {
        let draggedEl = ui.helper[0];
        draggedEl = $(draggedEl);
        draggedEl.removeClass('draggable-border');
        const itemType = draggedEl.attr('data-item-type');
        const itemText = draggedEl.attr('data-item-text');
        const top = ui.offset.top;
        const left = ui.offset.left;
        data.push({
            type: itemType,
            text: itemText,
            top: top,
            left: left,
            id: i+1 
        });
        localStorage.setItem('flowChartData', JSON.stringify(data));
        createNode(itemType, itemText, top, left);   
    }

    // Creating actual node on the canvas from initial rendering or sidebar drop
    function createNode(itemType, itemText, top, left, index) {
        const el = $("<div></div>").addClass('pos-abs draggable cursor-pointer' + (itemType === 'diamond' ? ' action-decision' : '')).css({ top: top, left: left });
        const elAction = $("<div></div>").addClass(itemType);
        if (itemType === 'diamond') {
            elAction.html('<span class="pos-abs decision">' + itemText + '</span>');
        } else {
            elAction.text(itemText)
        }
        const elDotTop = $("<div class='dot top'></div>");
        const elDotBottom = $("<div class='dot bottom'></div>");
        el.attr('id', index).append(elDotTop).append(elAction).append(elDotBottom);
        $('#droppable').append(el);
        $(el).draggable({
            delay: 100
        });
        $(elDotBottom).draggable({
            delay: 100,
            start: startStroke,
            drag: continueStroke,
            revert: true,
            revertDuration: 0,
        });
        $(elDotTop).droppable({
            drop: endStroke
        });
        $(elAction).on('click', nodeSelected);
    }

    // Selecting a node
    function nodeSelected() {
        const el = $(this);
        $('.node-selected').removeClass('node-selected');
        el.addClass('node-selected')
        $('#label').val(el.text());
    }

    // Updating the node label from the right sidebar
    function updateLabel() {
        const el = $(this);
        const selectedNode = $('.node-selected');
        if (selectedNode.has('.decision').length) {
            selectedNode.find('.decision').text(el.val());
        } else {
            selectedNode.text(el.val());
        }
    }

    // Start link creation between two nodes
    function startStroke(event, ui) {
        startStrokeX = ui.offset.left;
        startStrokeY = ui.offset.top;
    }

    // Stretch link creation between two nodes
    function continueStroke(event, ui) {
        const endStrokeX = ui.offset.left;
        const endStrokeY = ui.offset.top;
        linedraw(startStrokeX, startStrokeY, endStrokeX, endStrokeY);
    }

    // End link creation between two nodes
    function endStroke(event, ui) {
        const endStrokeX = ui.offset.left;
        const endStrokeY = ui.offset.top;
        data.push({
            type: 'connector',
            startX: startStrokeX,
            startY: startStrokeY,
            endX: endStrokeX,
            endY: endStrokeY    
        });
        localStorage.setItem('flowChartData', JSON.stringify(data));
        linedraw(startStrokeX, startStrokeY, endStrokeX, endStrokeY);
        startStrokeX = 0;
        startStrokeY = 0;
    }

    // Creating visual connection between two nodes
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
        const calc = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
        const length = Math.sqrt((startX - endX) * (startX - endX) + (startY - endY) * (startY - endY));
        $('#droppable').append("<div id='" + id + "' style='transform-origin: 0 100%;width:" + length + "px;height:1px;background-color:black;position:absolute;top:" + (startY) + "px;left:" + (startX) + "px;transform:rotate(" + calc + "deg);-ms-transform:rotate(" + calc + "deg);transform-origin:0% 100%;-moz-transform:rotate(" + calc + "deg);-moz-transform-origin:0% 100%;-webkit-transform:rotate(" + calc + "deg);-webkit-transform-origin:0% 100%;-o-transform:rotate(" + calc + "deg);-o-transform-origin:0% 100%;'></div>");
    }

    // Bind initial actions
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
                if (startStrokeX && startStrokeY) {
                    const id = 'line_' + startStrokeX + '_' + startStrokeY;
                    const line = document.getElementById(id);
                    line && line.remove();
                    return;
                }
                const el = ui.helper && ui.helper[0];
                if (el) {
                    const id = $(el).attr('id');
                    const dataItem = data[id];
                    dataItem.top = ui.offset.top;
                    dataItem.left = ui.offset.left;
                    data[id] = dataItem;
                    localStorage.setItem('flowChartData', JSON.stringify(data));
                }
            }
        })

        $('#label').on('blur', updateLabel);
    }

}
