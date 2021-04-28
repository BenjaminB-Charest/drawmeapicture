package com.example.polydessinmobile

class canvasAction {
    constructor(stroke: Stroke, type: CanvasActionType) {
        this.stroke = stroke
        this.type = type
    }

    var stroke: Stroke
    var type: CanvasActionType = CanvasActionType.Done
}