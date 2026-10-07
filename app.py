from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

DATA_FILE = "tasks.json"


def load_tasks():
    if not os.path.exists(DATA_FILE):
        return []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_tasks(tasks):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(tasks, file, indent=4, ensure_ascii=False)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    return jsonify(load_tasks())


@app.route("/api/tasks", methods=["POST"])
def create_task():
    tasks = load_tasks()
    data = request.json

    new_task = {
        "id": int(datetime.now().timestamp() * 1000),
        "title": data.get("title", "").strip(),
        "description": data.get("description", "").strip(),
        "priority": data.get("priority", "media"),
        "category": data.get("category", "Personal"),
        "completed": False,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M")
    }

    if not new_task["title"]:
        return jsonify({"error": "El título es obligatorio"}), 400

    tasks.append(new_task)
    save_tasks(tasks)

    return jsonify(new_task), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    tasks = load_tasks()
    data = request.json

    for task in tasks:
        if task["id"] == task_id:
            task.update(data)
            save_tasks(tasks)
            return jsonify(task)

    return jsonify({"error": "Tarea no encontrada"}), 404


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    tasks = load_tasks()

    new_tasks = [
        task for task in tasks
        if task["id"] != task_id
    ]

    if len(new_tasks) == len(tasks):
        return jsonify({"error": "Tarea no encontrada"}), 404

    save_tasks(new_tasks)

    return jsonify({"message": "Tarea eliminada"})


@app.route("/api/tasks/clear-completed", methods=["DELETE"])
def clear_completed():
    tasks = load_tasks()

    remaining = [
        task for task in tasks
        if not task["completed"]
    ]

    save_tasks(remaining)

    return jsonify({
        "message": "Tareas completadas eliminadas"
    })


if __name__ == "__main__":
    app.run(debug=True)
    