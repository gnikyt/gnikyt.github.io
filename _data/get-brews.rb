require 'net/http'
require 'yaml'
require 'json'

$config = YAML.load(File.open 'wunderlist.yml')

def wunderlist_get(type, params: nil)
  unless params == nil
    params = URI.encode(params.map{ |key, value| "#{key}=#{value}" }.join('&'))
  end

  uri                       = URI "http://a.wunderlist.com/api/v1/#{type}?#{params}"
  request                   = Net::HTTP::Get.new uri
  request['X-Access-Token'] = $config['access_token']
  request['X-Client-ID']    = $config['client_id']

  result = Net::HTTP.start(uri.hostname, uri.port) do |http|
    http.request request
  end

  JSON.parse(result.body)
end

current_brews   = wunderlist_get 'tasks', params: { list_id: $config['list_id'] }
completed_brews = wunderlist_get 'tasks', params: { list_id: $config['list_id'], completed: true }

brews = Array.new
[current_brews, completed_brews].each do |type|
  brews << type.map do |brew|
    _brew = {
      title: brew['title'],
      created: brew['created_at'],
      due: brew['due_date'],
      completed: brew['completed']
    }

    note = wunderlist_get 'notes', params: { task_id: brew['id'] }
    _brew[:note] = note[0]['content'] if note[0] # Note is my recipe information

    _brew
  end
end

File.write 'brews.json', brews.flatten.to_json