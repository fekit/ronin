# ====================
# Date and time
# ====================

###
# 判断是否为日期对象或日期格式的字符串
#
# @private
# @method  isDateFormat
# @return  {Boolean}
###
isDateFormat = ( date ) ->
  result = @isDate date

  if not result and @isString date
    # result = false

  return result

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
        

      validator: ( date ) ->
        return isDateFormat.call this, date

      value: new Date
    }
  ]
