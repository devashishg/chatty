const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const commentSchema = new Schema({
    log: { type: String },
    user: { type: String },
    time: { type: Number },
})

const attachment = new Schema({
    id: { type: String, required: true },
    fileName: { type: String, required: true },
    actualName: { type: String, required: true },
    time: { type: Number },
})

const schema = new Schema({
    storyNumber: { type: String, required: true},
    projectId: { type: String, required: true, index: true},
    projectName: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    component: { type: String, required: true },
    componentId: { type: String, required: true },
    sprint:String,
    priority: { type: String, required: true },
    reporter: { type: String, required: true },
    assignee: { type: String },
    status: { type: String, required: true },
    state: { type: String, required: true },
    description: { type: String, required: true },
    attachments: { type: [attachment], default: [] },
    dueDate: { type: Number },
    createDate: { type: Number },
    updated_On: { type: Number },
    comments: { type: [commentSchema], default: [] }
});




schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Story', schema);

