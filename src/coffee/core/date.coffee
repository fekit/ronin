# ====================
# Date and time
# ====================

###
# ISO 8601 日期字符串转化为日期对象
#
# @private
# @method   ISOstr2date
# @param    date_parts {Array}
# @return   {Date}
###
ISOstr2date = ( date_parts ) ->
  date_parts.shift()

  date = UTCstr2date.call this, date_parts
  tz_offset = timezoneOffset date_parts.slice(-1)[0]

  date.setTime(date.getTime() - tz_offset) unless tz_offset is 0

  return date

###
# 转化为 UTC 日期对象
#
# @private
# @method   UTCstr2date
# @param    date_parts {Array}
# @return   {Date}
###
UTCstr2date = ( date_parts ) ->
  handlers = [
      "FullYear"
      "Month"
      "Date"
      "Hours"
      "Minutes"
      "Seconds"
      "Milliseconds"
    ]
  date = new Date

  @each date_parts, ( ele, i ) ->
    if ele? and ele isnt ""
      handler = handlers[i]

      date["setUTC#{handler}"](ele * 1 + if handler is "Month" then -1 else 0) if handler?

  return date

###
# 相对于 UTC 的偏移值
#
# @private
# @method   timezoneOffset
# @param    timezone {String}
# @return   {Integer}
###
timezoneOffset = ( timezone ) ->
  offset = 0

  if /^(Z|[+-]\d{2}\:\d{2})$/.test timezone
    cap = timezone.charAt(0)

    if cap isnt "Z"
      offset = timezone.substring(1).split(":")
      offset = (cap + (offset[0] * 60 + offset[1] * 1)) * 60 * 1000

  return offset

storage.modules.Core.Date =
  handlers: [
    {
      ###
      # 格式化日期对象/字符串
      #
      # format 参照 PHP：
      #   http://www.php.net/manual/en/function.date.php
      # 
      # @method  date
      # @param   [date] {Date/String}
      # @param   [format] {String}
      # @return  {Date/String}
      ###
      name: "date"

      handler: ( date, format ) ->
        result = null

        if @isDate date
          d = date
        else if @isString date
          date = @trim date
          d = new Date date
          m = String(date).match storage.regexps.date.iso8601

          if isNaN d.getTime()
            # 为了兼容 IE9-
            d = if m? then ISOstr2date.call(this, m) else new Date

        return d        

      value: new Date
    },
    {
      ###
      # 取得当前时间
      #
      # @method   now
      # @param    [is_object] {Boolean}
      # @return   {Integer/Date}
      ###
      name: "now"

      handler: ( is_object ) ->
        date = new Date

        return if is_object is true then date else date.getTime()
    }
  ]
