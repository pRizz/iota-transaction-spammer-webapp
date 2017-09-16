/**
 * Created by Peter Ryszkiewicz (https://github.com/pRizz) on 9/10/2017.
 * https://github.com/pRizz/iota-transaction-spammer-webapp
 */

const hostingSite = 'https://github.com/pRizz/iota-transaction-spammer-webapp'
const hostingSiteTritified = iotaTransactionSpammer.tritifyURL(hostingSite)
const significantFigures = 3

function millisecondsToHHMMSS(milliseconds) {
    var sec_num = parseInt(`${milliseconds / 1000}`, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    return `${hours}:${minutes}:${seconds}`
}

$(function(){
    $('#nodeWarning').modal('show')

    iotaTransactionSpammer.options({
        message: hostingSiteTritified
    })

    iotaTransactionSpammer.eventEmitter.on('state', function(state) {
        console.log(`${new Date().toISOString()} New state: ${state}`)
        $('#eventLogContent').prepend(`<div>${new Date().toISOString()}: ${state}</div>`)
    })

    iotaTransactionSpammer.eventEmitter.on('transactionCountChanged', function(transactionCount) {
        $('#transactionCount')[0].innerText = transactionCount
    })

    iotaTransactionSpammer.eventEmitter.on('confirmationCountChanged', function(confirmationCount) {
        $('#confirmationCount')[0].innerText = confirmationCount
    })

    iotaTransactionSpammer.eventEmitter.on('averageConfirmationDurationChanged', function(averageConfirmationDuration) {
        $('#averageConfirmationDuration')[0].innerText = (averageConfirmationDuration / 1000).toFixed(significantFigures)
    })

    iotaTransactionSpammer.eventEmitter.on('transactionCompleted', function(success) {
        const iotasearchBaseURL = 'https://iotasear.ch/hash/'
        const iotaTipsBaseURL = 'http://www.iota.tips/search/?kind=transaction&hash='
        success.forEach((element) => {
            const iotaSearchURL = `${iotasearchBaseURL}${element.hash}`
            $('#eventLogContent').prepend(`<div>${new Date().toISOString()}: New transaction created: <a href="${iotaSearchURL}">${iotaSearchURL}</a> </div>`)

            const iotaTipsURL = `${iotaTipsBaseURL}${element.hash}`
            $('#eventLogContent').prepend(`<div>${new Date().toISOString()}: New transaction created: <a href="${iotaTipsURL}">${iotaTipsURL}</a> </div>`)

        })
        //console.log(success)
    })

    iotaTransactionSpammer.eventEmitter.on('working', function(started) {
        if (started) {
            // Stop gpu intensive tasks
            var elems = document.getElementsByClassName('spinnable')
            for (var i = 0; i < elems.length; i++) elems[i].classList.remove('spinning')
            var elems = document.getElementsByClassName('progress-bar-animated')
            for (var i = 0; i < elems.length; i++) elems[i].classList.remove('active')
        }
        else {
            // Restore gpu intensive tasks
            var elems = document.getElementsByClassName('spinnable')
            for (var i = 0; i < elems.length; i++) elems[i].classList.add('spinning')
            var elems = document.getElementsByClassName('progress-bar-animated')
            for (var i = 0; i < elems.length; i++) elems[i].classList.add('active')
        }
    })

    iotaTransactionSpammer.startSpamming()

    const startMilliseconds = Date.now()

    function durationInMinutes() {
        return durationInSeconds() / 60
    }

    function durationInSeconds() {
        return durationInMilliseconds() / 1000
    }

    function durationInMilliseconds() {
        return Date.now() - startMilliseconds
    }

    function updateTransactionsPerMinute() {
        $('#transactionsPerMinuteCount')[0].innerText = (iotaTransactionSpammer.getTransactionCount() / durationInMinutes()).toFixed(significantFigures)
    }
    function updateConfirmationsPerMinute() {
        const durationInMilliseconds = Date.now() - startMilliseconds
        $('#confirmationsPerMinuteCount')[0].innerText = (iotaTransactionSpammer.getConfirmationCount() / durationInMinutes()).toFixed(significantFigures)
    }
    function updateTimer() {
        $('#timeSpentSpamming')[0].innerText = millisecondsToHHMMSS(durationInMilliseconds())
    }

    setInterval(function(){
        updateTimer()
        updateTransactionsPerMinute()
        updateConfirmationsPerMinute()
    }, 1000)

})

