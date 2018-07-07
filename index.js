const fs = require('fs'),
    path = require('path'),
    colors = require('colors');

require('string-format-js');

const folder = __dirname;
const dataFolder = 'data'
const filename = '_chat.txt';

readFile(path.join(folder, dataFolder, filename))
    .then(splitLines)
    .then(cleanLines)
    .then(formatLines)
    .then(combineUsersMessages)
    .then(printStats)
    .catch(console.log)


function readFile(file) {
    return new Promise(function (resolve, reject) {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data)
            }
        });
    });
}

function splitLines(data) {
    return data.split('\n');
}

function cleanLines(lines) {
    return lines.filter((line) => {
        return !line.includes(" hat die Gruppe erstellt") && !line.includes("hat dich hinzugefügt") && !line.includes("‎Nachrichten an diese Gruppe sind jetzt mit Ende-zu-Ende-Verschlüsselung geschützt")   && !line.includes("removed")  && !!line
    })
}

function formatLines(lines) {
    let formatedLines = [];
    lines.forEach((line) => formatedLines.push(formatObject(line)))
    return formatedLines;
}

function formatDate(date, time) {
    let dateString = date.split(".");
    // console.log(dateString)
    return new Date(`20${dateString[2]}/${dateString[1]}/${dateString[0]} ${time}`)
}

let previouseLine;
function formatObject(line) {
    let m = /\[(\d+\.\d+\.\d+), (\d+:\d+:\d+)\] (.+?): (.+)/.exec(line)
    if (m != null) {
        previouseLine = {
            username: m[3],
            date: formatDate(m[1], m[2]),
            content: m[4]
        };
        return previouseLine
    } else {
        return {
            username: previouseLine.username,
            date: previouseLine.date,
            content: line
        }
    }
}

function combineUsersMessages(messages) {
    let stats = [];
    messages.forEach((message) => {
        if (stats.length === 0) {
            stats.push(message);
        } else {
            let userIndex = stats.map((user) => user.username).indexOf(message.username)

            if (userIndex !== -1) {
                if (typeof stats[userIndex].content === "object") {
                    stats[userIndex].content.push(message.content);
                } else {
                    stats[userIndex].content = [message.content];
                }
            } else {
                stats.push(message);
                let userIndex = stats.map((user) => user.username).indexOf(message.username);
                stats[userIndex].message = [message.content]
            }
        }
    })
    return stats;
}

function printStats(stats) {
    colors.setTheme({
        low: ['green', 'bold'],
        medium: ['yellow', 'bold'],
        high: ['red', 'bold'],
        ultra: ['cyan', 'bold']
    });
    let fullMesssages = 0;
    let fullWords = 0;
    stats.forEach((entry) => {
        let username = entry.username;
        let messagesCount = entry.content.length;
        fullMesssages +=messagesCount;
        let wordCount = 0;
        entry.content.forEach(message => wordCount += message.split(" ").length)
        fullWords +=wordCount;
        let ratio = function(words,message){
            return parseFloat(words/message).toPrecision(2)
        }

        let date = entry.date.toString();
        console.log(`${'%-25.25s'.format(username).ultra} Message Count: ${'%-11s'.format(messagesCount).ultra} Word Count: ${'%-5s'.format(wordCount).ultra} | Ratio: ${'%-5s'.format(ratio(wordCount,messagesCount)).ultra} | First Message: ${'%-21.21s'.format(date)}`)
    })
    console.log(`${'%-25s'.format("").high} Total Messages: ${'%-10s'.format(fullMesssages).high} Total Words: ${'%-10s'.format(fullWords).high}`)
}