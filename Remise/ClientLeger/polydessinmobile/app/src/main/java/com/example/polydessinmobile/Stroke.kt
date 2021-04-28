package com.example.polydessinmobile

import android.graphics.Color
import android.util.Log

class Stroke {
    constructor(path: MutableList<Vec2>, opacity: Int, color: Int, size: Float) {
        this.pathPencil.clear()
        for (p in path) {
            this.pathPencil.add(p)
        }
        this.pencilOpacity = opacity
        this.pencilColor = color
        this.pencilSize = size
    }

    constructor(path: MutableList<Vec2>, opacity: Int, color: Int, size: Float, id: Int) {
        this.pathPencil.clear()
        for (p in path) {
            this.pathPencil.add(p)
        }
        this.pencilOpacity = opacity
        this.pencilColor = color
        this.pencilSize = size
        this.id = id
        counter--
    }

    companion object {
        var counter: Int = -1
    }

    init {
        counter++
        Log.d("Main", counter.toString())
        this.id = counter
    }

    var pathPencil = mutableListOf<Vec2>()
    var pencilOpacity: Int = 255
    var pencilColor: Int = Color.BLACK
    var pencilSize: Float = 15F
    var id = 0
}