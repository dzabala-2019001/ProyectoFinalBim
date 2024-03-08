
import { initServer } from "./configs/app.js"
import { connect } from "./configs/mongo.js"
import {defaultCategory } from "./src/category/category.controller.js"

initServer()
connect()
defaultCategory()
