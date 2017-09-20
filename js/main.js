/**
 * Created by Peter Ryszkiewicz (https://github.com/pRizz) on 9/10/2017.
 * https://github.com/pRizz/iota-transaction-spammer-webapp
 */

const hostingSite = 'https://github.com/pRizz/iota-transaction-spammer-webapp'
const hostingSiteTritified = iotaTransactionSpammer.tritifyURL(hostingSite)
const significantFigures = 3

function millisecondsToHHMMSSms(milliseconds) {
    var sec_num = parseInt(`${milliseconds / 1000}`, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    var millisecondsNum = milliseconds % 1000

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (millisecondsNum < 10) {
        millisecondsNum = `00${millisecondsNum}`
    } else if (millisecondsNum < 100) {
        millisecondsNum = `0${millisecondsNum}`
    }
    return `${hours}:${minutes}:${seconds}:${millisecondsNum}`
}

function toggleNightMode() {
    $("body").toggleClass('night-mode')
    $("pre").toggleClass('night-mode')
    $(".panel").toggleClass('night-mode')
    $("img").toggleClass('inverted-image')
}

$(function(){
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
        const thetangleorgBaseURL = 'https://thetangle.org/transaction/'
        const iotasearchBaseURL = 'https://iotasear.ch/hash/'
        const iotaTipsBaseURL = 'http://www.iota.tips/search/?kind=transaction&hash='
        success.forEach((element) => {
            const thetangleorgURL = `${thetangleorgBaseURL}${element.hash}`
            $('#eventLogContent').prepend(`<div>${new Date().toISOString()}: New transaction created: <a href="${thetangleorgURL}">${thetangleorgURL}</a> </div>`)

            const iotaSearchURL = `${iotasearchBaseURL}${element.hash}`
            $('#eventLogContent').prepend(`<div>${new Date().toISOString()}: New transaction created: <a href="${iotaSearchURL}">${iotaSearchURL}</a> </div>`)

            const iotaTipsURL = `${iotaTipsBaseURL}${element.hash}`
            $('#eventLogContent').prepend(`<div>${new Date().toISOString()}: New transaction created: <a href="${iotaTipsURL}">${iotaTipsURL}</a> </div>`)

        })
    })

    $('#loadBalanceCheckbox').prop('checked', iotaTransactionSpammer.options().isLoadBalancing)

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
        $('#timeSpentSpamming')[0].innerText = millisecondsToHHMMSSms(durationInMilliseconds())
    }

    $('#settingsModal').on('hidden.bs.modal', function() {
        iotaTransactionSpammer.options({
            customProvider: $('#customHost')[0].value,
            isLoadBalancing: $('#loadBalanceCheckbox').is(':checked')
        })
    })

    setInterval(function(){
        updateTimer()
    }, 50)

    setInterval(function(){
        updateTransactionsPerMinute()
        updateConfirmationsPerMinute()
    }, 1000)

})

const app = angular.module("transactionSpammerApp", [])
app.controller("settingsController", function($scope) {
    $scope.hostList = iotaTransactionSpammer.validProviders
    $scope.selectedHost = iotaTransactionSpammer.options().provider
    $scope.$watch('selectedHost', (newValue) => {
        iotaTransactionSpammer.options({
            provider: newValue
        })
    })
    $scope.customHost = ""
})
