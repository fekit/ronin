# ====================
# Date and time
# ====================

###
# 判断是否为日期对象或日期格式的字符串
#
# @private
# @method   dateFormats
# @return   {Boolean}
###
dateFormats = ( format ) ->
  result = @isDate date

  if not result and @isString date
    result = false

  return result

###
# ISO 8601 日期字符串转化为日期对象
#
# @private
# @method   ISOstr2date
# @param    date_parts {Array}
# @return   {Boolean}
###
ISOstr2date = ( date_parts ) ->
  date_parts = @filter date_parts, ( ele ) ->
    return ele? and ele isnt ""

  date_parts.shift()

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
    h = handlers[i]
    offset = if h is "Month" then -1 else 0

    date["set#{h}"] ele.replace(/[+-.]/, "") * 1 + offset

  return date

storage.modules.Core.Date =
  value: new Date

  validator: ( object ) ->
    return @isDate object

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
          m = String(date).match storage.regexps.date.iso8601[0]

          if isNaN d.getTime()
            # 为了兼容 IE9-
            d = if m? then ISOstr2date.call(this, m) else new Date

        return d        

      validator: ( date ) ->
        return true

      value: new Date
    }
  ]
