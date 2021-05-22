const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');

const story = db.Story;
const { CONST_VALUES, STATUS_LIST } = require('../const/const');


module.exports = {
    getAllCollaborators,
    getStatuses,
    AddStory,
    UpdateStory,
    getStory,
    AddComment,
    getCount,
    deleteFile,
    logComment,
    UpdateProjectStoryCount
};

async function getCount(req, next) {
    const projectId = req.body.projectId;
    db.mongoose.connection.readyState !== 1
        ? next(new Error(CONST_VALUES.IS_ERROR))
        : await db.Project.findById(projectId, { ABBR: 1, storyCount: 1, _id: 0 }, { session: req._session }, (err, response) => {
            if (err) {
                throw new Error(err.message)
            } else {
                req.body.storyNumber = `${response.ABBR}${response.storyCount < 10 ? '0' + (response.storyCount + 1) : response.storyCount}`
                req.newProjStoryCount = response.storyCount+1;
                next();
            }
        })
}

/**
 * Creates a new Story
 * @param {Story Object} obj 
 * @param {HttpResponse} res 
 * @param {Next Middleware} next 
 */
async function AddStory(obj, req, next) {
    if (db.mongoose.connection.readyState !== 1) {
        throw new Error(CONST_VALUES.IS_ERROR)
    } else {
        await story.create([obj], { session: req._session }).then(
            data => {
                next();
            },
            err => {
                console.log(err.message);
                throw new Error(CONST_VALUES.IS_ERROR)
            }
        );
    }
}

async function UpdateProjectStoryCount(req, next) {
    if (db.mongoose.connection.readyState !== 1) {
        throw new Error(CONST_VALUES.IS_ERROR)
    } else {
        await db.Project.updateOne({_id: req.body.projectId}, { $set: { storyCount: req.newProjStoryCount } }, { session: req._session }, (err, response) => {
            if (err) {throw err; } else {
                next();
            }
        })
    }
}


/**
 * Update the story object with the incoming object
 * and sends response
 * @param {Updated Story Object} obj
 * @param {HttpResponse} res
 */
async function UpdateStory(req, res) {
    let obj = { ...req.body };
    db.mongoose.connection.readyState !== 1
        ? res.status(502).json(CONST_VALUES.IS_ERROR)
        : await story.updateOne({ _id: obj._id }, obj).then(
            data => {
                req.status = 200;
            },
            error => {
                res.status(502).json(CONST_VALUES.SWW);
            }
        );
}

/**
 * gets the list of collaborators for a project ID
 * and sends the response.
 * @param {string} id
 * @param {HttpResponse} res
 */
async function getAllCollaborators(id, res) {
    if (db.mongoose.connection.readyState !== 1) {
        res.status(502).json(CONST_VALUES.IS_ERROR);
    } else {
        await db.Project.findById(id, { collaborators: 1, _id: 0 }, (err, data) => {
            if (err) {
                res.status(502).json(CONST_VALUES.IS_ERROR);
            } else {
                res.status(200).json(data);
            }
        });
    }
}

/**
 * gets the story and sends the response with story object
 * @param {HttpResponse} res
 * @param {string} id
 */
async function getStory(res, id) {
    if (db.mongoose.connection.readyState !== 1) {
        res.status(502).json(CONST_VALUES.IS_ERROR);
    } else {
        await db.Story.findById(id, (err, data) => {
            if (err) {
                res.status(500).json(CONST_VALUES.SWW);
            }
            res.status(200).json(data);
        });
    }
}

/**
 * Returns the static status list
 */
function getStatuses() {
    return STATUS_LIST;
}

async function AddComment(comment, next) {
    if (db.mongoose.connection.readyState !== 1) {
        res.status(502).json(CONST_VALUES.IS_ERROR);
    } else {
        await db.Story.findByIdAndUpdate(req.id,
            { $push: { comments: { log: comment.message, user: comment.author, time: new Date().getTime() } } },
            (err, res) => {
                if (err) {
                    next(err);
                } else {
                    next();
                }
            })
    }
}
async function deleteFile(id, name) {
    if (db.mongoose.connection.readyState !== 1) {
        throw new Error(CONST_VALUES.IS_ERROR)
    } else {
        const story = await db.Story.findById(id);
        story.attachments = story.attachments.filter(attachment => attachment.fileName !== name );
        await story.save();
    }
}

async function logComment({ fileName, user, storyId, actualName}) {
    const message = `Attachment [${actualName}] has been deleted`;
    const author = user;
    return await db.Story.findByIdAndUpdate(storyId, { $push: { comments: { log: message, user: author, time: new Date().getTime() } } });
};

