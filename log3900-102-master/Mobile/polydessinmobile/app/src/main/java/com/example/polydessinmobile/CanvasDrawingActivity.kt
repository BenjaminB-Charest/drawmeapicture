package com.example.polydessinmobile

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.*
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.support.v4.os.IResultReceiver
import android.util.Log
import android.view.*
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.android.material.slider.Slider
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.android.synthetic.main.activity_main_menu.*
import kotlinx.android.synthetic.main.activity_multiplayer_drawing.*
import kotlinx.android.synthetic.main.end_game_confirmation.*
import yuku.ambilwarna.AmbilWarnaDialog
import java.util.*
import kotlin.collections.ArrayList
import kotlin.math.*


open class CanvasDrawingActivity: AppCompatActivity(), View.OnTouchListener {

    // Grid
    open val paintGrid = Paint(Paint.ANTI_ALIAS_FLAG)
    open var gridBitmap: Bitmap? = null
    open var gridCanvas: Canvas? = null
    open var gridPaint: Paint? = null
    open var gridWidthDisplay = 1154
    open var gridHeightDisplay = 675
    open var gridOpacity = 128
    open  var gridSize = 50
    open var gridOn = false

    //Others
    open var pathPencil = mutableListOf<Vec2>()
    open var strokes = mutableListOf<Stroke>()
    open var undoStack = mutableListOf<UndoRedoAction>()
    open var redoStack = mutableListOf<UndoRedoAction>()
    open lateinit var eraserMemory: Array<Array<MutableList<Stroke>>>
    open var alreadyUndoAction = mutableListOf<UndoRedoAction>()
    open var isWriting = false
    open var gameId = ""
    open var documentStroke = Firebase.firestore.collection("strokes").document("test2")
    open var runnables = mutableListOf<Runnable>()
    open var handler = Handler()

    // Code Canvas
    open var oldX = 0F
    open var oldY = 0F
    open var bitmap: Bitmap? = null
    open var canvas: Canvas? = null
    open var paint: Paint? = null
    //open var downX = 0f
    //open var downY: Float = 0f
    open val path: Path = Path()
    open var widthDisplay = 1154
    open var heightDisplay = 675

    // Pencil
    open var selectedTool = "pencil"
    open var pencilThickness = 15F
    open var pencilColor = Color.BLACK
    open var pencilOpacity = 255

    // Eraser
    open var eraserThickness = 15F
    open var oldPosEraser = Vec2(0F, 0F)


    @ExperimentalStdlibApi
    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_multiplayer_drawing)

        eraserMemory = Array(1154, {
            Array(675, {
                mutableListOf<Stroke>()
            })
        })
    }



    // DRAWER
    @ExperimentalStdlibApi
    open fun setDrawingTools(){
        canvasImageView.setOnTouchListener(this)
        ask_hint_button.visibility = View.GONE
        ask_hints_left.visibility = View.GONE

        setThicknessSlider() // Pour crayon et efface

        // Pencil
        activatePencil(pencilThickness, pencilColor, pencilOpacity)
        setPencilOpacitySlider()
        pencil_button.setOnClickListener{
            if(selectedTool != "pencil"){
                activatePencil(pencilThickness, pencilColor, pencilOpacity)
            }
        }

        // Eraser
        eraser_button.setOnClickListener{
                makeEraserSelectedTool()
        }

        // Grid
        createGrid()
        setGridSizeSlider()
        setGridOpacitySlider()
        grid_button.setOnClickListener{
            gridOn = !gridOn
            if(gridOn){
                grid_button.setBackgroundResource(R.drawable.rounded_corners_button_yellow_border)
                grid_tools.visibility = View.VISIBLE
                showGrid(gridSize, gridOpacity)
            }
            else {
                grid_button.setBackgroundResource(R.drawable.rounded_corners_button_pale_yellow)
                grid_tools.visibility = View.GONE
                hideGrid()
            }
        }

        // Set pencil colors on click listeners
        val colorButtonBackgrounds = mapOf(
            color1 to R.color.black,
            color2 to R.color.red,
            color3 to R.color.yellow,
            color4 to R.color.green,
            color5 to R.color.lime,
            color6 to R.color.blue,
            color7 to R.color.cyan,
            color8 to R.color.purple,
            color9 to R.color.pink,
            color10 to R.color.white
        )
        for(colorButton in colorButtonBackgrounds.keys){
            colorButton.setOnClickListener{
                selectedTool = "pencil"
                pencilColor = colorButtonBackgrounds[colorButton]?.let { it1 -> resources.getColor(
                    it1,
                    theme
                ) }!!
                // Remove old current color
                for(color in colorButtonBackgrounds.keys){
                    color.setBackgroundResource(0)
                }
                more_colors_color.visibility = View.GONE
                // Add gray border
                colorButton.setBackgroundResource(R.drawable.quick_color_access_selected)
                activatePencil(pencilThickness, pencilColor, pencilOpacity)
            }
        }

        // UNDO
        undo_button.setOnClickListener { undo(true) }

        // REDO
        redo_button.setOnClickListener { redo(true) }



        // COLOR PICKER
        color_picker_button.setOnClickListener {
            color_picker_button.visibility = View.VISIBLE
            for(color in colorButtonBackgrounds.keys){
                color.setBackgroundResource(0)
            }
            val colorPicker = AmbilWarnaDialog(this, pencilColor, object : AmbilWarnaDialog.OnAmbilWarnaListener {

                    override fun onCancel(dialog: AmbilWarnaDialog) {}

                    override fun onOk(dialog: AmbilWarnaDialog, color: Int) {
                        pencilColor = color
                        activatePencil(pencilThickness, pencilColor, pencilOpacity)

                        more_colors_color.visibility = View.VISIBLE
                        more_colors_color.background.setColorFilter(color, PorterDuff.Mode.DARKEN)
                        pencilColor = color
                    }

                })
            colorPicker.dialog.setTitle("                                      Color Picker") // crackhead move
            colorPicker.dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            colorPicker.show()

            pencilOpacity = 255
            pencil_opacity_slider.value = pencilOpacity.toFloat()

        }
    }

    // CANVAS
    open fun createCanvas(){
        canvasImageView.setImageResource(R.drawable.ic_arrow_right)
        bitmap = Bitmap.createBitmap(widthDisplay, heightDisplay, Bitmap.Config.ARGB_8888)
        canvas = Canvas(bitmap!!)
        canvasImageView.setImageBitmap(bitmap)
        paint = Paint()
        canvasImageView.setBackgroundColor(Color.WHITE)
    }

    // PENCIL
    open fun activatePencil(pencilWidth: Float, color: Int, pencilOpacity: Int){
        paint!!.color = Color.argb(
            pencilOpacity, Color.red(color), Color.green(color), Color.blue(
                color
            )
        )
        paint!!.strokeWidth = pencilWidth
        paint!!.strokeCap = Paint.Cap.ROUND
        paint!!.style = Paint.Style.FILL_AND_STROKE

        makePencilSelectedTool()
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouch(view: View?, event: MotionEvent?): Boolean {

            val init = event!!

            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    if (selectedTool == "pencil" && isWriting) {
                        oldX = event.x
                        oldY = event.y
                        pathPencil.add(Vec2(oldX, oldY))
                        // A garder --------------------------
                        /*strokes.add(Stroke(pathPencil, pencilOpacity, pencilColor, pencilThickness))
                     ServerRequest().addStrokePencil(strokes)*/
                        // -----------------------------------
                    } else if (selectedTool == "eraser" && isWriting) {
                        val strokesToRemove = eraserMemory[floor(event.x).toInt()][floor(event.y).toInt()]
                        strokes.removeAll(strokesToRemove)
                        for (s in strokesToRemove) {
                            if (undoStack.find { it.stroke.equals(s) && it.isErasing } == null) {
                                undoStack.add(UndoRedoAction(s, true))
                                ServerRequest().setStroke(canvasAction(s, CanvasActionType.Erased), documentStroke)
                            }
                        }
                        strokesToRemove.clear()
                        oldPosEraser = Vec2(event.x, event.y)
                        drawAllStrokes(strokes)
                    }
                    redoStack.clear()
                }

                MotionEvent.ACTION_MOVE -> {
                    if (selectedTool == "pencil" && isWriting) {
                        canvas?.drawLine(oldX, oldY, event.x, event.y, paint as Paint)
                        if(oldX == event.x && oldY == event.y) {
                            canvas?.drawCircle(oldX, oldY, 1F, paint as Paint)
                        }
                        oldX = event.x
                        oldY = event.y
                        pathPencil.add(Vec2(oldX, oldY))
                        // A garder --------------------------
                        /*strokes.set(strokes.size - 1, Stroke(pathPencil, pencilOpacity, pencilColor, pencilThickness))
                    ServerRequest().addStrokePencil(strokes)*/
                        // -----------------------------------
                    } else if (selectedTool == "eraser" && isWriting) {
                        val strokesToRemove = eraserMemory[xMaxVerificator(floor(event.x).toInt())][yMaxVerifactor(floor(event.y).toInt())]
                        val slope = (event.y - oldPosEraser.y) / (event.x - oldPosEraser.x)
                        if (slope == Float.NEGATIVE_INFINITY || slope == Float.POSITIVE_INFINITY) addStrokeToRemoveStraight(oldPosEraser.y, event.y, event.x, strokesToRemove, true)
                        else if (abs(slope.toInt()) == 0) addStrokeToRemoveStraight(oldPosEraser.x, event.x, event.y, strokesToRemove, false)
                        else if (abs(slope) > 1) addStrokeToRemoveY(slope, event, strokesToRemove)
                        else addStrokeToRemoveX(slope, event, strokesToRemove)
                        strokes.removeAll(strokesToRemove)
                        for (s in strokesToRemove) {
                            if (undoStack.find { it.stroke.equals(s) && it.isErasing } == null) {
                                undoStack.add(UndoRedoAction(s, true))
                                ServerRequest().setStroke(canvasAction(s, CanvasActionType.Erased), documentStroke)
                            }
                        }
                        strokesToRemove.clear()
                        oldPosEraser = Vec2(event.x, event.y)
                        drawAllStrokes(strokes)
                    }
                }
                MotionEvent.ACTION_UP -> {
                    if (selectedTool == "pencil" && isWriting) {
                        // A enlever --------------
                        val stroke = Stroke(pathPencil, pencilOpacity, pencilColor, pencilThickness)
                        ServerRequest().setStroke(canvasAction(stroke, CanvasActionType.Done), documentStroke)
                        strokes.add(stroke)
                        undoStack.add(UndoRedoAction(stroke, false))
                        // -------------------------
                        if (pathPencil.size == 1) {
                            paint!!.style = Paint.Style.FILL
                            canvas?.drawCircle(oldX, oldY, paint!!.strokeWidth/2, paint as Paint)
                            addEraserMemoryDot(stroke)
                            paint!!.style = Paint.Style.FILL_AND_STROKE
                        }
                        for (i in pathPencil.indices) {
                            if (i === (pathPencil.size - 1)) break
                            val slope = (pathPencil[i + 1].y - pathPencil[i].y) / (pathPencil[i + 1].x - pathPencil[i].x)
                            if (slope == Float.NEGATIVE_INFINITY || slope == Float.POSITIVE_INFINITY) addEraserMemoryStraight(pathPencil[i + 1].y, pathPencil[i].y, pathPencil[i].x, stroke, true)
                            else if (Math.abs(slope.toInt()) == 0) addEraserMemoryStraight(pathPencil[i + 1].x, pathPencil[i].x, pathPencil[i].y, stroke, false)
                            else if (Math.abs(slope) > 1) addEraserMemoryY(i, slope, stroke)
                            else addEraserMemoryX(i, slope, stroke)
                        }
                        pathPencil.clear()
                    }
                    redoStack.clear()
                }
                MotionEvent.ACTION_CANCEL -> {
                }
                else -> {
                }
            }
            canvasImageView.invalidate()
        return true
    }

    open fun drawImageRobot(imageId: String, difficulty: String) {
        ServerRequest().getStrokeRobot(object : MyCallBackCanvasActionList {
            override fun onCallBack(value: MutableList<canvasAction>) {
                runnables.clear()
                makePencilSelectedTool()
                var totalTime: Long = 0
                when (difficulty) {
                    "easy" -> totalTime = 15000
                    "normal" -> totalTime = 20000
                    "hard" -> totalTime = 25000
                }
                var nbPoints = 0
                for (v in value) nbPoints += v.stroke.pathPencil.size
                val timePerPoint: Long = totalTime / nbPoints
                var time: Long = 0
                for (v in value) {
                    Stroke.counter++
                    var count = 1
                    var oldPoint = Vec2(v.stroke.pathPencil[0].x, v.stroke.pathPencil[0].y)
                    if (v.stroke.pathPencil.size == 1) {
                        drawCircleTimer(oldPoint, time, v.stroke.pencilOpacity, v.stroke.pencilColor, v.stroke.pencilSize)
                        time += timePerPoint
                    }
                    while (count < (v.stroke.pathPencil.size - 1)){
                        drawLineTimer(oldPoint, v.stroke.pathPencil[count], time, v.stroke.pencilOpacity, v.stroke.pencilColor, v.stroke.pencilSize)
                        oldPoint = Vec2(v.stroke.pathPencil[count].x, v.stroke.pathPencil[count].y)
                        count++
                        time += timePerPoint
                    }
                }
            }
        }, Firebase.firestore.collection("drawings-library").document(imageId))
    }

    open fun drawCircleTimer(point: Vec2, time: Long, opacity: Int, color: Int, size: Float) {
        runnables.add(Runnable {
            paint!!.color = Color.argb(opacity, Color.red(color), Color.green(color), Color.blue(color))
            paint!!.strokeWidth = size
            paint!!.style = Paint.Style.FILL
            paint!!.strokeCap = Paint.Cap.ROUND
            canvas?.drawCircle(point.x, point.y, size/2, paint as Paint)
            paint!!.style = Paint.Style.FILL_AND_STROKE
        })
        handler.postDelayed(runnables.last(), time)
    }

    open fun drawLineTimer(firstPoint: Vec2, secondPoint: Vec2, time: Long, opacity: Int, color: Int, size: Float) {
        runnables.add(Runnable  {
            paint!!.color = Color.argb(opacity, Color.red(color), Color.green(color), Color.blue(color))
            paint!!.strokeWidth = size
            paint!!.strokeCap = Paint.Cap.ROUND
            canvas?.drawLine(firstPoint.x, firstPoint.y, secondPoint.x, secondPoint.y, paint as Paint)
            if(firstPoint.x == secondPoint.x && firstPoint.y == secondPoint.y) {
                paint!!.style = Paint.Style.FILL
                canvas?.drawCircle(firstPoint.x, firstPoint.y, size/2, paint as Paint)
                paint!!.style = Paint.Style.FILL_AND_STROKE
            }
        })
        handler.postDelayed(runnables.last(), time)
    }

    @ExperimentalStdlibApi
    open fun setGameID(game_id: String) {
        gameId = game_id
        documentStroke = Firebase.firestore.collection("strokes").document(gameId)
        ServerRequest().getStrokeRealTime(object : MyCallBackCanvasAction {
            override fun onCallBack(value: canvasAction) {
                Log.d("Main", gameId)
                if (!isWriting) {
                    when (value.type) {
                        CanvasActionType.Erased -> {
                            makeEraserSelectedTool()
                            val aStroke = strokes.find { it.id == value.stroke.id }
                            if (aStroke != null) undoStack.add(UndoRedoAction(aStroke, true))
                            strokes.remove(strokes.find { it.id == value.stroke.id })
                            drawAllStrokes(strokes)
                            if (selectedTool == "pencil") makePencilSelectedTool()
                        }
                        CanvasActionType.Done -> {
                            makePencilSelectedTool()
                            strokes.add(value.stroke)
                            undoStack.add(UndoRedoAction(value.stroke, false))
                            drawStroke(value.stroke)
                            if (selectedTool == "eraser") makeEraserSelectedTool()
                        }
                        CanvasActionType.Undo -> undo(false)
                        CanvasActionType.Redo -> redo(false)
                    }
                }
            }
        }, documentStroke)
    }

    open fun reset() {
        for (r in runnables) handler.removeCallbacks(r)
        runnables.clear()
        canvas?.drawColor(Color.WHITE)
        strokes.clear()
        undoStack.clear()
        redoStack.clear()
        alreadyUndoAction.clear()
    }

    @ExperimentalStdlibApi
    open fun undo(isWriting: Boolean) {
        if (undoStack.isNotEmpty() && isWriting) ServerRequest().setStroke(canvasAction(undoStack.last().stroke, CanvasActionType.Undo), documentStroke)
        if (undoStack.isNotEmpty() && undoStack.last().isErasing) {
            makePencilSelectedTool()
            drawStroke(undoStack.last().stroke)
            redoStack.add(undoStack.last())
            strokes.add(undoStack.last().stroke)
            alreadyUndoAction.remove(undoStack.last())
            undoStack.removeLast()
            if (selectedTool == "eraser") makeEraserSelectedTool()
        } else if (undoStack.isNotEmpty()) {
            makeEraserSelectedTool()
            redoStack.add(undoStack.last())
            strokes.remove(undoStack.last().stroke)
            drawAllStrokes(strokes)
            alreadyUndoAction.add(undoStack.last())
            undoStack.removeLast()
            if (selectedTool == "pencil") makePencilSelectedTool()
        }
    }

    @ExperimentalStdlibApi
    open fun redo(isWriting: Boolean) {
        if (redoStack.isNotEmpty() && isWriting) ServerRequest().setStroke(canvasAction(redoStack.last().stroke, CanvasActionType.Redo), documentStroke)
        if (redoStack.isNotEmpty() && redoStack.last().isErasing) {
            makeEraserSelectedTool()
            undoStack.add(redoStack.last())
            strokes.remove(redoStack.last().stroke)
            drawAllStrokes(strokes)
            alreadyUndoAction.add(undoStack.last())
            redoStack.removeLast()
            if (selectedTool == "pencil") makePencilSelectedTool()
        } else if (redoStack.isNotEmpty()) {
            makePencilSelectedTool()
            drawStroke(redoStack.last().stroke)
            undoStack.add(redoStack.last())
            strokes.add(redoStack.last().stroke)
            alreadyUndoAction.remove(redoStack.last())
            redoStack.removeLast()
            if (selectedTool == "eraser") makeEraserSelectedTool()
        }
    }

    open fun xMaxVerificator(indice: Int) : Int {
        if (indice >= 1154) return 1153
        if (indice < 0) return 0
        return indice
    }

    open fun yMaxVerifactor(indice: Int) : Int {
        if (indice >= 675) return 674
        if (indice < 0) return 0
        return indice
    }

    open fun addStrokeToRemoveStraight(firstPointNormal: Float, secondPointNormal: Float, perpendicularPoint: Float, strokesToRemove: MutableList<Stroke>, isVertical: Boolean) {
        var count = floor(min(firstPointNormal, secondPointNormal)).toInt()
        while (count <= max(firstPointNormal, secondPointNormal)) {
            val deltaY = eraserThickness /2
            var countPerpendicular = Math.floor(perpendicularPoint - deltaY.toDouble()).toInt()
            while (countPerpendicular <= perpendicularPoint + deltaY) {
                if (isVertical) strokesToRemove.addAll(eraserMemory[xMaxVerificator(countPerpendicular)][yMaxVerifactor(count)])
                else strokesToRemove.addAll(eraserMemory[xMaxVerificator(count)][yMaxVerifactor(countPerpendicular)])
                countPerpendicular++
            }
            count++
        }
    }

    open fun addStrokeToRemoveY(slope: Float, event: MotionEvent, strokesToRemove: MutableList<Stroke>) {
        val diff = oldPosEraser.y - slope * oldPosEraser.x
        var count = floor((min(oldPosEraser.y, event.y))).toInt()
        while (count <= floor((max(oldPosEraser.y, event.y)))) {
            val xV = (count - diff) / slope
            val perpendicularSlope = -Math.pow(slope.toDouble(), -1.0)
            val perpendicularDiff = count - perpendicularSlope * xV
            val angle = Math.atan(Math.abs(perpendicularSlope))
            val deltaX = eraserThickness / 2 * Math.cos(angle)
            var perpendicularCount = Math.floor(xV - deltaX).toInt()
            while (perpendicularCount <= (xV + deltaX)) {
                strokesToRemove.addAll(eraserMemory[xMaxVerificator(perpendicularCount)][yMaxVerifactor(floor(perpendicularSlope * perpendicularCount.toFloat() + perpendicularDiff).toInt())])
                perpendicularCount++
            }
            count++
        }
    }

    open fun addEraserMemoryDot(stroke: Stroke) {
        var xStart = floor(stroke.pathPencil[0].x - stroke.pencilSize/2).toInt()
        var yStart = floor(stroke.pathPencil[0].y - stroke.pencilSize/2).toInt()
        while (xStart <= (stroke.pathPencil[0].x + stroke.pencilSize/2)) {
            while (yStart <= (stroke.pathPencil[0].y + stroke.pencilSize/2)) {
                eraserMemory[xStart][yStart].add(stroke)
                yStart++
            }
            xStart++
        }
    }

    open fun addStrokeToRemoveX(slope: Float, event: MotionEvent, strokesToRemove: MutableList<Stroke>) {
        val diff = oldPosEraser.y - slope * oldPosEraser.x
        var count = floor((min(oldPosEraser.x, event.x))).toInt()
        while (count <= floor((max(oldPosEraser.x, event.x)))) {
            val yV = slope * count + diff
            val perpendicularSlope = -Math.pow(slope.toDouble(), -1.0)
            val perpendicularDiff = yV - perpendicularSlope * count
            val angle = Math.atan(Math.abs(perpendicularSlope))
            val deltaY = Math.abs(eraserThickness / 2 * Math.sin(angle))
            var perpendicularCount = Math.floor(yV - deltaY).toInt()
            while (perpendicularCount <= (yV + deltaY)) {
                strokesToRemove.addAll(eraserMemory[xMaxVerificator(Math.floor((perpendicularCount - perpendicularDiff) / perpendicularSlope).toInt())][yMaxVerifactor(perpendicularCount)])
                perpendicularCount++
            }
            count++
        }
    }

    open fun addEraserMemoryX(i: Int, slope: Float, stroke: Stroke) {
        val diff = pathPencil[i].y - slope * pathPencil[i].x
        var count = floor((min(pathPencil[i + 1].x, pathPencil[i].x))).toInt()
        while (count <= floor((max(pathPencil[i + 1].x, pathPencil[i].x)))) {
            val yV = slope * count + diff
            val perpendicularSlope = -Math.pow(slope.toDouble(), -1.0)
            val perpendicularDiff = yV - perpendicularSlope * count
            val angle = Math.atan(Math.abs(perpendicularSlope))
            val deltaY = Math.abs(pencilThickness / 2 * Math.sin(angle))
            var perpendicularCount = Math.floor(yV - deltaY).toInt()
            while (perpendicularCount <= (yV + deltaY)) {
                eraserMemory[xMaxVerificator(Math.floor((perpendicularCount - perpendicularDiff) / perpendicularSlope).toInt())][yMaxVerifactor(perpendicularCount)].add(stroke)
                perpendicularCount++
            }
            count++
        }
    }

    open fun addEraserMemoryY(i: Int, slope: Float, stroke: Stroke) {
        val diff = pathPencil[i].y - slope * pathPencil[i].x
        var count = floor((min(pathPencil[i + 1].y, pathPencil[i].y))).toInt()
        while (count <= floor((max(pathPencil[i + 1].y, pathPencil[i].y)))) {
            val xV = (count - diff) / slope
            val perpendicularSlope = -Math.pow(slope.toDouble(), -1.0)
            val perpendicularDiff = count - perpendicularSlope * xV
            val angle = Math.atan(Math.abs(perpendicularSlope))
            val deltaX = pencilThickness / 2 * Math.cos(angle)
            var perpendicularCount = Math.floor(xV - deltaX).toInt()
            while (perpendicularCount <= (xV + deltaX)) {
                eraserMemory[xMaxVerificator(perpendicularCount)][yMaxVerifactor(floor(perpendicularSlope * perpendicularCount.toFloat() + perpendicularDiff).toInt())].add(stroke)
                perpendicularCount++
            }
            count++
        }
    }

    open fun addEraserMemoryStraight(firstPointNormal: Float, secondPointNormal: Float, perpendicularPoint: Float, stroke: Stroke, isVertical: Boolean) {
        var count = floor((min(firstPointNormal, secondPointNormal))).toInt()
        val max = floor((max(firstPointNormal, secondPointNormal))).toInt()
        while (count <= max) {
            var countPerpendicular = (floor(perpendicularPoint).toInt() - pencilThickness / 2).toInt()
            while (countPerpendicular <= (floor(perpendicularPoint).toInt() + pencilThickness / 2)) {
                if (isVertical) eraserMemory[xMaxVerificator(countPerpendicular)][yMaxVerifactor(count)].add(stroke)
                else eraserMemory[xMaxVerificator(count)][yMaxVerifactor(countPerpendicular)].add(stroke)
                countPerpendicular++
            }
            count++
        }
    }

    open fun drawStroke(stroke: Stroke) {
        paint!!.color = Color.argb(stroke.pencilOpacity, Color.red(stroke.pencilColor), Color.green(stroke.pencilColor), Color.blue(stroke.pencilColor))
        paint!!.strokeCap = Paint.Cap.ROUND
        paint!!.strokeWidth = stroke.pencilSize
        //var p = Path()
        if (stroke.pathPencil.size == 1) {
            paint!!.style = Paint.Style.FILL
            canvas?.drawCircle(stroke.pathPencil[0].x, stroke.pathPencil[0].y, paint!!.strokeWidth/2, paint as Paint)
            paint!!.style = Paint.Style.FILL_AND_STROKE
        }
        for (t in stroke.pathPencil.indices) {
            if (t == 0) continue
            canvas?.drawLine(stroke.pathPencil[t-1].x, stroke.pathPencil[t-1].y, stroke.pathPencil[t].x, stroke.pathPencil[t].y, paint as Paint)
            //p.moveTo(stroke.pathPencil[t-1].x, stroke.pathPencil[t-1].y)
            //p.lineTo(stroke.pathPencil[t].x, stroke.pathPencil[t].y)
            if(stroke.pathPencil[t-1].x == stroke.pathPencil[t].x && stroke.pathPencil[t-1].y == stroke.pathPencil[t].y) {
                canvas?.drawCircle(stroke.pathPencil[t].x, stroke.pathPencil[t].y, 1F, paint as Paint)
            }
        }
        //canvas?.drawPath(p, paint as Paint)
        paint!!.strokeWidth = pencilThickness
        paint!!.color = Color.argb(pencilOpacity, Color.red(pencilColor), Color.green(pencilColor), Color.blue(pencilColor))
    }

    open fun drawAllStrokes(strokes: MutableList<Stroke>) {
        canvas?.drawColor(Color.WHITE)
        for (s in strokes) {
            paint!!.color = Color.argb(s.pencilOpacity, Color.red(s.pencilColor), Color.green(s.pencilColor), Color.blue(s.pencilColor))
            paint!!.strokeCap = Paint.Cap.ROUND
            paint!!.strokeWidth = s.pencilSize
            if (s.pathPencil.size == 1) {
                paint!!.style = Paint.Style.FILL
                canvas?.drawCircle(s.pathPencil[0].x, s.pathPencil[0].y, paint!!.strokeWidth/2, paint as Paint)
                paint!!.style = Paint.Style.FILL_AND_STROKE
            }
            //var p = Path()
            for (t in s.pathPencil.indices) {
                if (t == 0) continue
                canvas?.drawLine(s.pathPencil[t-1].x, s.pathPencil[t-1].y, s.pathPencil[t].x, s.pathPencil[t].y, paint as Paint)
                //p.moveTo(s.pathPencil[t-1].x, s.pathPencil[t-1].y)
                //p.lineTo(s.pathPencil[t].x, s.pathPencil[t].y)
                if(s.pathPencil[t-1].x == s.pathPencil[t].x && s.pathPencil[t-1].y == s.pathPencil[t].y) {
                    canvas?.drawCircle(s.pathPencil[t].x, s.pathPencil[t].y, 1F, paint as Paint)
                }
            }
            //canvas?.drawPath(p, paint as Paint)
        }
        paint!!.strokeWidth = pencilThickness
        paint!!.color = Color.argb(pencilOpacity, Color.red(pencilColor), Color.green(pencilColor), Color.blue(pencilColor))
    }

    @SuppressLint("SetTextI18n")
    open fun makePencilSelectedTool(){
        selectedTool = "pencil"
        tool_label.text = "Pencil :"
        pencil_button.setBackgroundResource(R.drawable.rounded_corners_button_yellow_border)
        eraser_button.setBackgroundResource(R.drawable.rounded_corners_button_pale_yellow)
        thickness_slider.value = pencilThickness
        showPencilSettings()
    }

    open fun setPencilOpacitySlider(){
        pencil_opacity_slider.addOnSliderTouchListener(object : Slider.OnSliderTouchListener {
            // Ne fait rien mais impossible de l'enlever
            override fun onStartTrackingTouch(slider: Slider) {
                // Responds to when slider's touch event is being started
                Log.e("onStartTrackingTouch", slider.value.toString())
            }

            override fun onStopTrackingTouch(slider: Slider) {
                // Responds to when slider's touch event is being stopped
                pencilOpacity = slider.value.toInt()
                activatePencil(pencilThickness, pencilColor, pencilOpacity)
            }
        })
        thickness_slider.setLabelFormatter { value: Float ->
            return@setLabelFormatter "${value.roundToInt()} px"
        }
    }

    open fun showPencilSettings() {
        transparent_pencil.visibility = View.VISIBLE
        pencil_opacity_slider.visibility = View.VISIBLE
        opaque_pencil.visibility = View.VISIBLE
    }

    open fun hidePencilSettings() {
        transparent_pencil.visibility = View.GONE
        pencil_opacity_slider.visibility = View.GONE
        opaque_pencil.visibility = View.GONE
    }

    @SuppressLint("SetTextI18n")
    open fun makeEraserSelectedTool(){
        selectedTool = "eraser"
        tool_label.text = "Eraser :"
        eraser_button.setBackgroundResource(R.drawable.rounded_corners_button_yellow_border)
        pencil_button.setBackgroundResource(R.drawable.rounded_corners_button_pale_yellow)
        thickness_slider.value = eraserThickness
        hidePencilSettings()
    }


    open fun setThicknessSlider(){
        thickness_slider.addOnSliderTouchListener(object : Slider.OnSliderTouchListener {
            // Ne fait rien mais impossible de l'enlever
            override fun onStartTrackingTouch(slider: Slider) {
                // Responds to when slider's touch event is being started
                Log.d("onStartTrackingTouch", slider.value.toString())
            }

            override fun onStopTrackingTouch(slider: Slider) {
                // Responds to when slider's touch event is being stopped
                if (selectedTool == "pencil") {
                    pencilThickness = slider.value
                    activatePencil(pencilThickness, pencilColor, pencilOpacity)
                } else { // Efface
                    eraserThickness = slider.value
                }
            }
        })
        thickness_slider.setLabelFormatter { value: Float ->
            return@setLabelFormatter "${value.roundToInt()} px"
        }
    }


    // GRID
    open fun createGrid(){
        gridBitmap = Bitmap.createBitmap(
            gridWidthDisplay,
            gridHeightDisplay,
            Bitmap.Config.ARGB_8888
        )
        gridCanvas = Canvas(gridBitmap!!)
        gridImageView.setImageBitmap(gridBitmap)
        gridPaint = Paint()
    }

    open fun showGrid(squareSize: Int, opacity: Int){
        hideGrid()
        var startX = 0F
        var startY = 0F

        paintGrid.strokeWidth = 2F
        val color = Color.BLACK
        paintGrid.color = Color.argb(
            opacity,
            Color.red(color),
            Color.green(color),
            Color.blue(color)
        )
        while (startX < gridWidthDisplay){
            gridCanvas!!.drawLine(startX, 0F, startX, gridHeightDisplay.toFloat(), paintGrid)
            startX += squareSize
        }

        while (startY < gridHeightDisplay){
            gridCanvas!!.drawLine(0F, startY, gridWidthDisplay.toFloat(), startY, paintGrid)
            startY += squareSize
        }
    }

    open fun hideGrid(){
        gridCanvas!!.drawColor(Color.TRANSPARENT, PorterDuff.Mode.CLEAR)
        gridImageView.invalidate()
    }

    open fun setGridSizeSlider(){
        grid_slider.addOnSliderTouchListener(object : Slider.OnSliderTouchListener {
            // Ne fait rien mais impossible de l'enlever
            override fun onStartTrackingTouch(slider: Slider) {
                // Responds to when slider's touch event is being started
                Log.d("onStartTrackingTouch", slider.value.toString())
            }

            override fun onStopTrackingTouch(slider: Slider) {
                // Responds to when slider's touch event is being stopped
                gridSize = slider.value.toInt()
                showGrid(gridSize, gridOpacity)
            }
        })
        thickness_slider.setLabelFormatter { value: Float ->
            return@setLabelFormatter "${value.roundToInt()} px"
        }
    }

    open fun setGridOpacitySlider(){
        grid_opacity_slider.addOnSliderTouchListener(object : Slider.OnSliderTouchListener {
            // Ne fait rien mais impossible de l'enlever
            override fun onStartTrackingTouch(slider: Slider) {
                // Responds to when slider's touch event is being started
                Log.e("onStartTrackingTouch", slider.value.toString())
            }

            override fun onStopTrackingTouch(slider: Slider) {
                // Responds to when slider's touch event is being stopped
                gridOpacity = slider.value.toInt()
                showGrid(gridSize, gridOpacity)
            }
        })
        thickness_slider.setLabelFormatter { value: Float ->
            return@setLabelFormatter "${value.roundToInt()} px"
        }
    }

}