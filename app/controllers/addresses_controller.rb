require 'geokit'

class AddressesController < ApplicationController

  respond_to :html, :json

  def index
    @in_district = false
    @lat = nil, @lng = nil, @address = nil

    if params[:address] != nil and !params[:address].empty?
      @address = Geokit::Geocoders::MultiGeocoder.geocode params[:address]
      @in_district = CouncilDistrict.inDistrict? @address.lat, @address.lng
      @lat = @address.lat
      @lng = @address.lng
      puts "LAT/LON from address: " + @lat.to_s + "/" + @lng.to_s
    end

    if params[:lat] != nil  and params[:long] != nil and !params[:lat].empty? and !params[:long].empty?
      @address = Geokit::Geocoders::MultiGeocoder.reverse_geocode "#{params[:lat]}, #{params[:long]}"
      @in_district = CouncilDistrict.inDistrict? params[:lat], params[:long]
      @lat = params[:lat]
      @lng = params[:long]
      puts "LAT/LON from params: " + @lat.to_s + "/" + @lon.to_s
    end

    if @address != nil
      @addr = @address.full_address
      @district_polygon = CouncilDistrict.getDistrict @lat, @lng
      if @district_polygon and @district_polygon.id
         @event_items = EventItem.joins(:event).where('"events"."date" > ?', 4.month.ago).
                                                 where(council_district_id: @district_polygon.id).
                                                 order('"events"."date" DESC')

        attachments = @event_items.map(&:attachments) #see http://ablogaboutcode.com/2012/01/04/the-ampersand-operator-in-ruby/
        events = @event_items.map(&:event).uniq #see http://ablogaboutcode.com/2012/01/04/the-ampersand-operator-in-ruby/

      else
        puts "ERROR: Whaaaaaat?! No district/id. You ran rake council_districts:load to populate the table right?"
      end
    end

    @response = { :lat                    => @lat,
                  :lng                    => @lng,
                  :address                => @addr,
                  :in_district       => @in_district,
                  :district_polygon  => @district_polygon,
                  :event_items       => @event_items,
                  :districts         => CouncilDistrict.getDistricts,
                  :attachments => attachments,
                  :events => events
                }
    respond_with(@response)
  end
end
