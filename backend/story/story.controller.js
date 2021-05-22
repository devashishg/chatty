const express = require('express');
const router = express.Router();
const storyService = require('./story.service');
const sendMailToUser = require('../_helpers/mail');
const db = require('../_helpers/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const stream = require('stream');
const { google } = require('googleapis');
const { authorize, changePermission, FOLDER_ID } = require('../_helpers/drive');
const { CONST_VALUES,
    storyCreateMailSubject,
    storyUpdateMailSubject,
    StoryUpdateMessage,
    StoryResolveMessage,
    StoryAssigneeMessage,
    StoryReporterMessage } = require('../const/const');

upload = multer({
    storage: multer.memoryStorage(),
}).single('attachment');
// routes

router.get('/get-collaborators/:projectId', getCollaborators);
router.get('/getStatusList', getStatusList);
router.patch('/', updateStory, sendMail);
router.post('/', getStoryCount, saveStory, setStoryCount, sendCreateStoryMail, sendCreateStoryResponse);
router.get('/get/:id', getStory);
router.post('/delete', deleteAttachment);
router.post('/upload/:id', upload, saveToGoogleDrive);

module.exports = router;

/**
 * middleware function to save the new story
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {*} next
 */
async function getStoryCount(req, res, next) {
    try {
        await db.db.startSession({}, async (err, session) => {
            if (err) { throw new Error('Session Error!') }
            req._session = session;
            await req._session.startTransaction()
            await storyService.getCount(req, next)
        })
    } catch (err) {
        console.log('Abort 1' + err.message + '\n\n');
        await req._session.abortTransaction(); res.status(403).json(err.message);
        await req._session.endSession();
    }

}


/**
 * middleware function to save the new story
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {*} next
 */
async function saveStory(req, res, next) {
    try {
        await storyService.AddStory({ ...req.body }, req, next);
    } catch (error) {
        console.log('Abort 2' + error.message + '\n\n');
        await req._session.abortTransaction(); res.status(403).json(error.message);
        await req._session.endSession();
    }
}

/**
 * middleware function to save the new story
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {*} next
 */
async function setStoryCount(req, res, next) {
    try {
        await storyService.UpdateProjectStoryCount(req, next);
    } catch (error) {
        console.log('Abort 3' + error.message + '\n\n');
        await req._session.abortTransaction(); res.status(403).json(error.message);
        await req._session.endSession();
    }
}


/**
 * middleware function to send mail the users in the story
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {*} next
 */
async function sendCreateStoryMail(req, res, next) {
    try {
        await req._session.commitTransaction().then(data => {
            let user = req.cookies['user'];
            let obj = { ...req.body };
            let subject = storyCreateMailSubject(obj.summary);
            if (obj.assignee !== obj.reporter) {
                if (obj.assignee.split('@').length === 2) {
                    let assignee = obj.assignee.split('@');
                    let message = StoryAssigneeMessage(obj.summary, user, obj.dueDate, obj.reporter);
                    sendMailToUser(assignee[0], obj.assignee, subject, message);
                }
                if (obj.reporter.split('@').length === 2) {
                    let reporter = obj.reporter.split('@');
                    let message = StoryReporterMessage(obj.summary, user, obj.dueDate, obj.assignee);
                    sendMailToUser(reporter[0], obj.reporter, subject, message);
                }
            } else {
                if (obj.reporter.split('@').length === 2) {
                    let reporter = obj.reporter.split('@');
                    let message = StoryReporterMessage(obj.summary, user, obj.dueDate, 'none');
                    sendMailToUser(reporter[0], obj.reporter, subject, message);
                }
            }


            next();
        })
    } catch (error) {
        console.log('Abort 4' + error.message + '\n\n');
        await req._session.abortTransaction(); res.status(403).json(error.message);
    } finally {
        await req._session.endSession();
    }
}

function sendCreateStoryResponse(req, res, next) {
    res.status(200).json(CONST_VALUES.ST_SUCCESS);
}

function updateStory(req, res, next) {
    storyService.UpdateStory(req, res).then(data => {
        if (req.status === 200) {
            next();
        };
    })
}

function sendMail(req, res, next) {
    let user = req.cookies['user'];
    const obj = { ...req.body };
    const receipent = [];
    if (obj.assignee !== obj.reporter) {
        if (obj.assignee.split('@').length === 2) {
            receipent.push(obj.assignee);
        }
        if (obj.reporter.split('@').length === 2) {
            receipent.push(obj.reporter);
        }
    } else {
        if (obj.reporter.split('@').length === 2) {
            receipent.push(obj.reporter);
        }
    }
    const comment = req.body.comments;

    try {
        receipent.map(receipt => {
            subject = storyUpdateMailSubject(obj.summary);
            if (comment) {
                lastComment = comment[comment.length - 1];
                message = StoryUpdateMessage(obj.summary, user, lastComment);
                sendMailToUser(receipt.split('@')[0], receipt, subject, message);
                return true;
            } else {
                message = StoryResolveMessage(obj.summary, user, obj.status);
                sendMailToUser(receipt.split('@')[0], receipt, subject, message);
                return true;
            }
        });
    } catch (error) {
        console.error(error);
    }
    res.status(200).json(CONST_VALUES.ST_UPDATE);
}

function getCollaborators(req, res, next) {
    storyService.getAllCollaborators(req.params.projectId, res);
}

function getStatusList(req, res, next) {
    res.json(storyService.getStatuses());
}

function getStory(req, res, next) {
    storyService.getStory(res, req.params.id);
}


// read the file from buffer and convert it to stream
async function saveToGoogleDrive(req, res, next) {
    let fileObjects = req.file;
    let fileName = `KANBAN-${Date.now()}${path.extname(fileObjects.originalname)}`;
    fs.readFile('./backend/_helpers/credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        if (fileObjects) {
            let bufferStream = new stream.PassThrough();
            bufferStream.end(fileObjects.buffer);
            authorize(JSON.parse(content), {
                stream: bufferStream,
                filename: fileName,
                mimeType: fileObjects.mimetype
            },
                // it will upload the file to googleDrive            
                async ({ stream, filename, mimeType }, auth) => {
                    const drive = google.drive({ version: 'v3', auth: auth });
                    await drive.files.create({
                        requestBody: {
                            name: filename,
                            mimeType: mimeType,
                            parents: [FOLDER_ID]
                        },
                        media: {
                            mimeType: mimeType,
                            body: stream,
                        },
                        fields: 'id'
                    }, (err, file) => {
                        if (err) {
                            res.status(400).json({ error: err });
                        } else {
                            res.status(200).json({ file: { ...req.file, ...file.data, filename: fileName } });
                        }
                    });
                });
        } else {
            res.status(400).json('Bad request');
        }
    });
}

function deleteAttachment(req, res, next) {
    const body = req.body;
    const fileId = body.fileId;
    storyService.deleteFile(body.storyId, body.fileName).then(
        data => {
            storyService.logComment(body).then(data => {
                fs.readFile('./backend/_helpers/credentials.json', (err, content) => {
                    if (err) return console.log('Error loading client secret file:', err);
                    // Authorize a client with credentials, then call the Google Drive API.
                    authorize(JSON.parse(content), {
                        fileId: fileId,
                    },
                        async ({ fileId }, auth) => {
                            const drive = google.drive({ version: 'v3', auth: auth });
                            await drive.files.delete({
                                fileId: fileId,
                                parents: [FOLDER_ID]
                            }).then(data => {
                                res.status(200).json({ status: 'OK', message: 'File Deleted successfully' });
                            }).catch(err => {
                                console.log(err);
                                res.status(400).json('File Deleted from story, failed to delete from drive');
                            })
                        });
                });
            }).catch(err => {
                res.status(400).json({ message: 'Something went wrong while logging deletion for the file', error: err });
            })
        }, err => {
            res.status(400).json({ message: 'Something went wrong while deleting the file', error: err });
        }
    ).catch(err => {
        res.status(400).json({ message: 'Error occurred while deleting the file', error: err });
    })
}