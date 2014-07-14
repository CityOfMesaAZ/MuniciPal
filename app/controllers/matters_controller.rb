class MattersController < ApplicationController
  before_action :set_matter, only: [:show, :edit, :update, :destroy]

  # GET /matters
  # GET /matters.json
  def index
    @matters = Matter.all
  end

  # GET /matters/1
  # GET /matters/1.json
  def show
  end

  # GET /matters/new
  def new
    @matter = Matter.new
  end

  # GET /matters/1/edit
  def edit
  end

  # POST /matters
  # POST /matters.json
  def create
    @matter = Matter.new(matter_params)

    respond_to do |format|
      if @matter.save
        format.html { redirect_to @matter, notice: 'Matter was successfully created.' }
        format.json { render action: 'show', status: :created, location: @matter }
      else
        format.html { render action: 'new' }
        format.json { render json: @matter.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /matters/1
  # PATCH/PUT /matters/1.json
  def update
    respond_to do |format|
      if @matter.update(matter_params)
        format.html { redirect_to @matter, notice: 'Matter was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @matter.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /matters/1
  # DELETE /matters/1.json
  def destroy
    @matter.destroy
    respond_to do |format|
      format.html { redirect_to matters_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_matter
      @matter = Matter.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def matter_params
      params.require(:matter).permit(:matterid, :matterguid, :matterlastmodifiedutc, :matterrowversion, :matterfile, :mattername, :mattertitle, :mattertypeid, :mattertypename, :matterstatusid, :matterstatusname, :matterbodyid, :matterbodyname, :matterintrodate, :matteragendadate, :matterpasseddate, :matterenactmentdate, :matterenactmentnumber, :matterrequester, :matternotes, :matterversion, :mattertext1, :mattertext2, :mattertext3, :mattertext4, :mattertext5, :matterdate1, :matterdate2)
    end
end