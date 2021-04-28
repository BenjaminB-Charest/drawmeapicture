package com.example.polydessinmobile

import com.google.protobuf.Empty

class UndoRedoAction {
    constructor(stroke: Stroke, isErasing: Boolean) {
        this.stroke = stroke
        this.isErasing = isErasing
    }

    var stroke: Stroke
    var isErasing: Boolean
}