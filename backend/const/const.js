

const CONST_VALUES = {
    SWW: 'Something went wrong',
    DB_CON: 'DB not connected',
    SWW_PTA: 'Something went wrong, Please try again later!',
    PAE: 'Project already exist!',
    PC_SUCCESS: 'Project created successfully!!',
    IS_ERROR: 'Internal server error!!',
    ST_UPDATE: 'Story updated successfully',
    ST_SUCCESS: 'Story saved successfully!',
    NEW_USER: 'You have no active project, please route here After creating One. :)',
    PRO_NONE: 'None',
    WRONG_REQ: 'On snap! Double check your url. Something\'s wrong in there.',
    INV_REQ: 'Invalid request!',
    TERR_PTA: 'Transaction error, please try again later!!'
}

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = './token.json';
const FOLDER_ID = "1XS8ewWLdGGfykP-BAUl464PLWD160Sfm";
const ProjectCreateMessage = (title, ownerName) => {
    return `
    <table width="100%" cellspacing="3" cellpadding="0" align="center">
        <tbody>
        <tr>
            <td style="padding: 15px 10px 15px 10px;"><strong>Project: ${title}</strong></td>
        </tr>
        <tr>
            <td style="padding: 15px 10px 15px 10px;">${ownerName} created a new project <em>"${title}"</em> and invited you to collaborate with team.<br /> Thanks</td>
        </tr>
        <tr>
            <td style="padding: 15px 10px 15px 10px;"><br />Regards,<br />Team Kanban2020<br /><a style="text-decoration: none;" href="https://kanban2020.herokuapp.com/">KANBAN2020</a></td>
        </tr>
        </tbody>
    </table>
    <p><small><em>This is an auto-generated e-mail. Please do not reply.</em></small></p>
    `
};

const StoryUpdateMessage = (summary, user, lastComment) => {
    return `
    <table width="100%" cellspacing="3" cellpadding="0" align="center">
        <tbody>
            <tr>
                <td style="padding: 15px 10px 15px 10px;"><strong>Story: ${summary}</strong></td>
            </tr>
            <tr>
                <td style="padding: 5px 15px 5px 15px;">
                <p><em>${user ? user.name : 'user'}</em> updated the story (<strong> ${summary} </strong>) and added the below comment.</p>
                </td>
            </tr>
            <tr>
                <td style="background-color: #f0f6ff; border-radius: 15px; padding-left: 30px;"><strong> '${lastComment.log}'</strong><br /> <small>${new Date(lastComment.time).toDateString()}</small></td>
            </tr>
            <tr>
                <td style="padding: 15px 10px 15px 10px;">Thanks &amp; Regards,<br />Team Kanban2020<br /><a style="text-decoration: none;" href="https://kanban2020.herokuapp.com/">KANBAN2020</a></td>
            </tr>
        </tbody>
    </table>

    <small><i>This is an auto-generated e-mail. Please do not reply.</i></small>
    `;
};

const StoryResolveMessage = (summary, user, status) => {
    return `
        <table width="100%" cellspacing="3" cellpadding="0" align="center">
            <tbody>
                <tr>
                    <td style="padding: 15px 10px 15px 10px;"><strong>Story: ${summary}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 15px 10px 15px 10px;"><em>${user ? user.name : 'user'}</em> resolved the story (<strong> ${summary} </strong>) with status '${status}'.</td>
                </tr>
                <tr>
                    <td style="padding: 15px 10px 15px 10px;">Thanks &amp; Regards,<br />Team Kanban2020<br /><a style="text-decoration: none;" href="https://kanban2020.herokuapp.com/">KANBAN2020</a></td>
                </tr>
            </tbody>
        </table>
        <small><i>This is an auto-generated e-mail. Please do not reply.</i></small> `;
}

const StoryAssigneeMessage = (summary,user,dueDate,reporter)=>{
    return `
    <table width="100%" cellspacing="3" cellpadding="0" align="center">
    <tbody>
        <tr>
            <td style="padding: 15px 10px 15px 10px;"><strong><span>Story</span>: ${summary}</strong></td>
        </tr>
        <tr>
            <td style="padding: 15px 10px 15px 10px;"><em>${user ? user.name : 'user'}</em> created a new story <strong> ${summary}</strong> 
            and assigned to you. Due date for the story is <em>${new Date(dueDate).toDateString()} </em> <strong>${reporter.split('@')[0]}</strong> is reporter for this story.</td>
            <td>&nbsp;</td>
        </tr>
        <tr>
            <td style="padding: 15px 10px 15px 10px;">Thanks & Regards,<br />Team Kanban2020<br /><a style="text-decoration: none;" href="https://kanban2020.herokuapp.com/">KANBAN2020</a></td>
        </tr>
    </tbody>
    </table>
    
    <small><i>This is an auto-generated e-mail. Please do not reply.</i></small>
    `;
}



const StoryReporterMessage = (summary,user,dueDate,assignee)=>{
    return `
    <table width="100%" cellspacing="3" cellpadding="0" align="center">
    <tbody>
        <tr>
            <td style="padding: 15px 10px 15px 10px;"><strong>Story: ${summary}</strong></td>
        </tr>
        <tr>
            <td style="padding: 15px 10px 15px 10px;">
            <p><em>${user ? user.name : 'user'}</em> created a new story '<strong>${summary}'&nbsp;</strong> added you as reporter for the story.</p>
            <p>Story is assigned to <em>${assignee.split('@')[0]}</em> and Due date for the story is <em>${new Date(dueDate).toDateString()}</em>. </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 15px 10px 15px 10px;">Thanks &amp; Regards,<br />Team Kanban2020<br /><a style="text-decoration: none;" href="https://kanban2020.herokuapp.com/">KANBAN2020</a></td>
        </tr>
    </tbody>
    </table>

    <small><i>This is an auto-generated e-mail. Please do not reply.</i></small>
    `;
}


let ProjectMailSubject = (title) => {
    return `[Kanban2020] New Project <${title}> created`;
};
let storyCreateMailSubject = (summary) => {
    return `[Kanban2020] New story <${summary}> is created`;
};
let storyUpdateMailSubject = (summary) => {
    return `[Kanban2020] Story <${summary}> is updated `;
};

const STATUS_LIST = [
    'Fixed',
    'Rejected',
    'Cannot Reproduce',
    'Duplicate',
    "Won't Fix",
    'Approved',
    'Abandoned - No Consensus',
    'Implemented',
    'Functions as intended',
    'Obsolete',
    'Expired',
    'Canceled',
    'Out of Scope',
    'Project Closed',
    'Assigned',
    'Avoided',
    'Mitigated',
    'Transferred',
    'Occurred',
    'Won',
    'Lost',
    "Won't Do",
    'Delivered',
    'Shortlisting Won',
    'Done without NCs',
    'Done with NCs',
    'Resolved within target date',
    'Resolved after target date',
    'Resolved during audit',
    'Closed',
    'Incomplete',
    'Developed',
    'Functioning as Designed',
    'On Hold',
    'Won (Started)',
    'Won (Can’t Staff)',
    'Won (Can’t Negotiate)'
];

module.exports = {
    ProjectMailSubject,
    ProjectCreateMessage, CONST_VALUES, STATUS_LIST,
    storyUpdateMailSubject,
    storyCreateMailSubject,
    StoryUpdateMessage, StoryResolveMessage,
    StoryAssigneeMessage, StoryReporterMessage,
    SCOPES, TOKEN_PATH, FOLDER_ID
};